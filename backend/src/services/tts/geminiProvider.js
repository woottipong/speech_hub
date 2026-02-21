'use strict';

const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../../config');

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Encodes raw PCM audio data into a WAV Buffer.
 * @param {Buffer} pcmData - Raw 16-bit signed little-endian PCM samples
 * @param {number} sampleRate - Sample rate in Hz (default 24000)
 * @param {number} channels - Number of audio channels (default 1)
 * @returns {Buffer}
 */
function encodeWav(pcmData, sampleRate = 24000, channels = 1) {
    const bitsPerSample = 16;
    const byteRate = (sampleRate * channels * bitsPerSample) / 8;
    const blockAlign = (channels * bitsPerSample) / 8;
    const dataSize = pcmData.length;
    const headerSize = 44;

    const buffer = Buffer.alloc(headerSize + dataSize);
    let offset = 0;

    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(channels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(byteRate, offset); offset += 4;
    buffer.writeUInt16LE(blockAlign, offset); offset += 2;
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;
    pcmData.copy(buffer, offset);

    return buffer;
}

/**
 * Synthesizes text to speech using Gemini TTS.
 * @param {{ text: string, voice: string, multiSpeakerConfig?: Array<{speaker: string, voiceName: string}> }} params
 * @returns {Promise<{ buffer: Buffer, contentType: string }>}
 */
async function synthesizeGemini({ text, voice = 'Kore', multiSpeakerConfig = null }) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const speechConfig = multiSpeakerConfig ? {
        multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: multiSpeakerConfig.map(config => ({
                speaker: config.speaker,
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: config.voiceName }
                }
            }))
        }
    } : {
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
        },
    };

    const response = await client.models.generateContent({
        model: GEMINI_TTS_MODEL,
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: speechConfig,
        },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
        throw new Error('Gemini TTS returned no audio data');
    }

    const pcmBuffer = Buffer.from(inlineData.data, 'base64');
    const wavBuffer = encodeWav(pcmBuffer);

    return { buffer: wavBuffer, contentType: 'audio/wav' };
}

module.exports = { synthesizeGemini };
