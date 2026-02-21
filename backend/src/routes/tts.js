const express = require('express');
const { TTS_MAX_CHARS } = require('../config');
const { synthesizeAzure } = require('../services/tts/azureProvider');
const { synthesizeGemini } = require('../services/tts/geminiProvider');

const router = express.Router();

const PROVIDERS = {
    azure: synthesizeAzure,
    gemini: synthesizeGemini,
};

/**
 * POST /api/tts
 * Backend proxy for TTS — supports Azure and Gemini providers.
 * Body: { text: string, voice: string, style?: string, provider?: 'azure' | 'gemini', multiSpeakerConfig?: Array<{speaker: string, voiceName: string}> }
 * Returns: audio blob (audio/mpeg for Azure, audio/wav for Gemini)
 */
router.post('/tts', async (req, res) => {
    const { text, voice, style = '', provider = 'azure', multiSpeakerConfig } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'กรุณาระบุข้อความ' });
    }
    if (text.length > TTS_MAX_CHARS) {
        return res.status(400).json({ error: `ข้อความต้องไม่เกิน ${TTS_MAX_CHARS.toLocaleString()} ตัวอักษร` });
    }

    const synthesize = PROVIDERS[provider];
    if (!synthesize) {
        return res.status(400).json({ error: `Unknown TTS provider: ${provider}` });
    }

    try {
        const params = { text: text.trim(), voice, style };
        if (provider === 'gemini' && multiSpeakerConfig) {
            params.multiSpeakerConfig = multiSpeakerConfig;
        }
        const { buffer, contentType } = await synthesize(params);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (err) {
        console.error(`[tts/${provider}] Error:`, err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

module.exports = router;
