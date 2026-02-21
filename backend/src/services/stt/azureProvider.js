const fs = require('fs');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = require('../../config');

/**
 * Converts Azure offset (100-nanosecond ticks) to VTT timestamp: HH:MM:SS.mmm
 * @param {number} offsetTicks
 * @returns {string}
 */
function ticksToVttTime(offsetTicks) {
    const totalMs = Math.floor(offsetTicks / 10_000);
    const ms = totalMs % 1000;
    const totalSec = Math.floor(totalMs / 1000);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60) % 60;
    const hour = Math.floor(totalSec / 3600);
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Builds VTT content from Azure segments.
 * @param {Array<{text: string, offset: number, duration: number}>} segments
 * @returns {string}
 */
function buildVtt(segments) {
    const cues = segments.map((seg, idx) => {
        const start = ticksToVttTime(seg.offset);
        const end = ticksToVttTime(seg.offset + seg.duration);
        return `${idx + 1}\n${start} --> ${end}\n${seg.text}`;
    });
    return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}

/**
 * Transcribes a WAV file using Azure Speech SDK Continuous Recognition.
 * @param {string} wavPath - Absolute path to 16kHz mono WAV file.
 * @param {string} [language='th-TH'] - BCP-47 language code.
 * @returns {Promise<string>} - WebVTT formatted string.
 */
async function transcribeToVtt(wavPath, language = 'th-TH') {
    if (!AZURE_SPEECH_KEY) throw new Error('AZURE_SPEECH_KEY is not set');
    if (!AZURE_SPEECH_REGION) throw new Error('AZURE_SPEECH_REGION is not set');

    console.log(`[azure] Starting real-time transcription (Lang: ${language})`);

    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = language;

    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const segments = [];

    await new Promise((resolve, reject) => {
        let settled = false;

        const finalizeSuccess = () => {
            if (settled) return;
            settled = true;
            recognizer.close();
            resolve(buildVtt(segments));
        };

        const finalizeError = (error) => {
            if (settled) return;
            settled = true;
            recognizer.close();
            reject(error);
        };

        recognizer.recognized = (_sender, event) => {
            if (
                event.result.reason === sdk.ResultReason.RecognizedSpeech &&
                event.result.text.trim()
            ) {
                segments.push({
                    text: event.result.text.trim(),
                    offset: event.result.offset,
                    duration: event.result.duration,
                });
            }
        };

        recognizer.sessionStopped = () => {
            finalizeSuccess();
        };

        recognizer.canceled = (_sender, event) => {
            if (event.reason === sdk.CancellationReason.Error) {
                finalizeError(new Error(`Azure STT error: ${event.errorDetails}`));
                return;
            }
            finalizeSuccess();
        };

        recognizer.startContinuousRecognitionAsync(
            () => {
                console.log('[azure] Recognition started:', wavPath);
                const fileStream = fs.createReadStream(wavPath, { highWaterMark: 256 * 1024 });
                fileStream.on('data', (chunk) => pushStream.write(chunk));
                fileStream.on('end', () => pushStream.close());
                fileStream.on('error', (err) => {
                    pushStream.close();
                    finalizeError(new Error(`File read error: ${err.message}`));
                });
            },
            (err) => {
                finalizeError(new Error(`Failed to start recognition: ${err}`));
            },
        );
    });
}

module.exports = { transcribeToVtt };
