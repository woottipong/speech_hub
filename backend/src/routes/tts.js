const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, TTS_MAX_CHARS, TTS_OUTPUT_FORMAT } = require('../config');

const router = express.Router();

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
 * For multilingual voices (not th-TH), wraps the text in a <lang xml:lang="th-TH">
 * element so Azure pronounces Thai text correctly.
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
 * POST /api/tts
 * Backend proxy for Azure TTS — keeps the subscription key server-side.
 * Body: { text: string, voice: string, style?: string }
 * Returns: audio/mpeg blob
 */
router.post('/tts', async (req, res) => {
    const { text, voice = 'th-TH-PremwadeeNeural', style = '' } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'กรุณาระบุข้อความ' });
    }
    if (text.length > TTS_MAX_CHARS) {
        return res.status(400).json({ error: `ข้อความต้องไม่เกิน ${TTS_MAX_CHARS.toLocaleString()} ตัวอักษร` });
    }

    const safeStyle = ALLOWED_STYLES.has(style.trim()) ? style.trim() : '';

    try {
        const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
        speechConfig.speechSynthesisOutputFormat =
            sdk.SpeechSynthesisOutputFormat[TTS_OUTPUT_FORMAT];

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
        const ssml = buildSsml(voice, safeStyle, text.trim());

        await new Promise((resolve, reject) => {
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
                        const audioBuffer = Buffer.from(result.audioData);
                        res.setHeader('Content-Type', 'audio/mpeg');
                        res.setHeader('Content-Length', audioBuffer.length);
                        res.send(audioBuffer);
                        resolve();
                    } else {
                        console.error('[tts] Synthesis cancelled:', result.errorDetails);
                        reject(new Error(result.errorDetails || 'TTS synthesis failed'));
                    }
                },
                (err) => {
                    clearTimeout(timer);
                    synthesizer.close();
                    reject(new Error(err?.message || 'TTS error'));
                },
            );
        });
    } catch (err) {
        console.error('[tts] Error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

module.exports = router;
