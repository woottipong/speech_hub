'use strict';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10);
const PORT = parseInt(process.env.PORT || '3001', 10);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173'];

const JOB_TTL_MS = parseInt(process.env.JOB_TTL_MS || String(2 * 60 * 60 * 1000), 10); // 2 hours default
const JOB_CLEANUP_INTERVAL_MS = parseInt(process.env.JOB_CLEANUP_INTERVAL_MS || String(15 * 60 * 1000), 10); // 15 min

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const STT_LOCATION = process.env.STT_LOCATION || 'global';
const GOOGLE_CLOUD_STORAGE_BUCKET = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
const STT_RECOGNIZER = process.env.STT_RECOGNIZER || '_';
const STT_MODEL = process.env.STT_MODEL || 'chirp_2';

const TTS_MAX_CHARS = 3000;
const TTS_OUTPUT_FORMAT = 'Audio16Khz128KBitRateMonoMp3';

function getMissingEnv(requiredKeys) {
    return requiredKeys.filter((key) => !process.env[key]);
}

function validateConfig(logger = console) {
    const requiredAzureEnv = ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'];
    const missingAzure = getMissingEnv(requiredAzureEnv);
    if (missingAzure.length > 0) {
        throw new Error(`Missing required environment variables: ${missingAzure.join(', ')}`);
    }

    const optionalGoogleEnv = ['GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT', 'GOOGLE_CLOUD_STORAGE_BUCKET'];
    const missingGoogle = getMissingEnv(optionalGoogleEnv);
    if (missingGoogle.length > 0) {
        logger.warn(`⚠️  Google STT unavailable — missing: ${missingGoogle.join(', ')}`);
        logger.warn('   Set these in .env to enable Google Cloud Speech-to-Text v2.');
    }

    if (!process.env.GEMINI_API_KEY) {
        logger.warn('⚠️  Gemini TTS unavailable — GEMINI_API_KEY is not set.');
        logger.warn('   Get a key at https://aistudio.google.com/apikey and add it to .env.');
    }
}

module.exports = {
    PORT,
    MAX_FILE_SIZE_MB,
    ALLOWED_ORIGINS,
    JOB_TTL_MS,
    JOB_CLEANUP_INTERVAL_MS,
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    GEMINI_API_KEY,
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_CLOUD_PROJECT,
    STT_LOCATION,
    GOOGLE_CLOUD_STORAGE_BUCKET,
    STT_RECOGNIZER,
    STT_MODEL,
    TTS_MAX_CHARS,
    TTS_OUTPUT_FORMAT,
    validateConfig,
};
