const express = require('express');
const jobStore = require('../jobs/jobStore');

const router = express.Router();

/**
 * GET /api/status/:jobId
 * Returns current job status: queued | processing | completed | failed
 */
router.get('/status/:jobId', (req, res) => {
    const job = jobStore.get(req.params.jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
    }

    const { status, step, provider, vtt, error, etaSec, transcribeStartedAt } = job;
    res.json({
        jobId: req.params.jobId,
        status,
        ...(step && { step }),
        ...(provider && { provider }),
        ...(etaSec && { etaSec }),
        ...(transcribeStartedAt && { transcribeStartedAt }),
        ...(vtt && { vtt }),
        ...(error && { error }),
    });
});

module.exports = router;
