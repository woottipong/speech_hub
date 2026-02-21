'use strict';

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, TTS_OUTPUT_FORMAT } = require('../../config');

const TTS_TIMEOUT_MS = 30_000;

const ALLOWED_STYLES = new Set([
    'empathetic', 'relieved', 'excited', 'friendly',
    'funny', 'shy', 'sad', 'serious',
]);

/**
 * Escapes special XML characters in text for safe SSML embedding.
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Builds an SSML string for the given voice, optional style, and text.
 * @param {string} voice  - Azure voice short name
 * @param {string} style  - Speaking style (empty string = no style)
 * @param {string} text   - Plain text to synthesize
 * @returns {string}
 */
function buildSsml(voice, style, text) {
    const isMultilingual = !voice.startsWith('th-TH');
    const safeText = escapeXml(text);
    const langWrapped = isMultilingual
        ? `<lang xml:lang="th-TH">${safeText}</lang>`
        : safeText;

    const inner = style
        ? `<mstts:express-as style="${style}">${langWrapped}</mstts:express-as>`
        : langWrapped;

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="th-TH">` +
        `<voice name="${voice}">${inner}</voice>` +
        `</speak>`;
}

/**
 * Synthesizes text to speech using Azure Cognitive Services.
 * @param {{ text: string, voice: string, style?: string }} params
 * @returns {Promise<{ buffer: Buffer, contentType: string }>}
 */
async function synthesizeAzure({ text, voice = 'th-TH-PremwadeeNeural', style = '' }) {
    const safeStyle = ALLOWED_STYLES.has(style.trim()) ? style.trim() : '';

    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat[TTS_OUTPUT_FORMAT];

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
    const ssml = buildSsml(voice, safeStyle, text);

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            synthesizer.close();
            reject(new Error('TTS request timed out after 30 seconds'));
        }, TTS_TIMEOUT_MS);

        synthesizer.speakSsmlAsync(
            ssml,
            (result) => {
                clearTimeout(timer);
                synthesizer.close();
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    resolve({
                        buffer: Buffer.from(result.audioData),
                        contentType: 'audio/mpeg',
                    });
                } else {
                    reject(new Error(result.errorDetails || 'Azure TTS synthesis failed'));
                }
            },
            (err) => {
                clearTimeout(timer);
                synthesizer.close();
                reject(new Error(err?.message || 'Azure TTS error'));
            },
        );
    });
}

module.exports = { synthesizeAzure };
