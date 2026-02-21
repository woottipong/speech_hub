const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const express = require('express');

const { MAX_FILE_SIZE_MB } = require('../config');
const jobStore = require('../jobs/jobStore');
const transcribeWorker = require('../workers/transcribeWorker');

const router = express.Router();

const ALLOWED_PROVIDERS = new Set(['azure', 'google']);
const LANGUAGE_CODE_REGEX = /^[a-z]{2,3}-[A-Z]{2}$/;

// Multer storage — preserve original extension in uploads/
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
    },
});

// MIME type whitelist
const fileFilter = (_req, file, cb) => {
    const allowed = /^(audio|video)\//;
    if (allowed.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(Object.assign(new Error('Only audio and video files are accepted.'), { status: 400 }));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

/**
 * POST /api/upload
 * Accepts audio/video file, creates a transcription job and returns jobId immediately.
 */
router.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const jobId = randomUUID();
        const language = req.body.language || 'th-TH';
        const provider = req.body.provider || 'azure';

        if (!ALLOWED_PROVIDERS.has(provider)) {
            return res.status(400).json({ error: 'Invalid provider. Allowed values: azure, google.' });
        }

        if (!LANGUAGE_CODE_REGEX.test(language)) {
            return res.status(400).json({ error: 'Invalid language code. Expected BCP-47 format like th-TH.' });
        }

        jobStore.create(jobId, { filePath: req.file.path, language, provider });

        // Kick off background processing (non-blocking)
        setImmediate(() => transcribeWorker.process(jobId));

        res.status(202).json({ jobId, status: 'queued' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
