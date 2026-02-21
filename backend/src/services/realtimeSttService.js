'use strict';

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = require('../config');

/**
 * Creates an Azure Continuous Recognizer backed by a PushAudioInputStream.
 * Audio chunks (PCM 16kHz 16-bit mono) are written via pushChunk().
 * Results are emitted via the provided callbacks.
 *
 * @param {object} opts
 * @param {string}   opts.language        - BCP-47 language code (e.g. 'th-TH')
 * @param {function} opts.onRecognizing   - Called with interim text while speaking
 * @param {function} opts.onRecognized    - Called with final text after each utterance
 * @param {function} opts.onError         - Called with Error on failure
 * @param {function} opts.onSessionStopped - Called when session ends
 * @returns {{ pushChunk: (Buffer) => void, stop: () => void }}
 */
function createRealtimeSession({ language = 'th-TH', onRecognizing, onRecognized, onError, onSessionStopped }) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = language;

    // PCM 16kHz 16-bit mono — matches what the browser MediaRecorder sends after conversion
    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (_sender, event) => {
        if (event.result.reason === sdk.ResultReason.RecognizingSpeech) {
            onRecognizing?.(event.result.text);
        }
    };

    recognizer.recognized = (_sender, event) => {
        if (
            event.result.reason === sdk.ResultReason.RecognizedSpeech &&
            event.result.text.trim()
        ) {
            onRecognized?.(event.result.text.trim());
        }
    };

    recognizer.canceled = (_sender, event) => {
        if (event.reason === sdk.CancellationReason.Error) {
            onError?.(new Error(`Azure STT error: ${event.errorDetails}`));
        }
        recognizer.stopContinuousRecognitionAsync(() => recognizer.close());
    };

    recognizer.sessionStopped = () => {
        recognizer.stopContinuousRecognitionAsync(() => {
            recognizer.close();
            onSessionStopped?.();
        });
    };

    recognizer.startContinuousRecognitionAsync(
        () => console.log('[realtimeStt] Session started, language:', language),
        (err) => onError?.(new Error(`Failed to start recognition: ${err}`)),
    );

    return {
        pushChunk(chunk) {
            pushStream.write(chunk);
        },
        stop() {
            pushStream.close();
        },
    };
}

module.exports = { createRealtimeSession };
