/**
 * In-memory job store — tracks transcription jobs by ID.
 * Each job: { status, filePath, language, vtt?, error?, createdAt }
 * Suitable for single-instance / dev use. Replace with Redis for production.
 *
 * Completed/failed jobs are automatically evicted after JOB_TTL_MS to prevent
 * unbounded memory growth.
 */

const { JOB_TTL_MS, JOB_CLEANUP_INTERVAL_MS } = require('../config');

const jobs = new Map();

const JobStatus = {
    QUEUED: 'queued',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

function create(jobId, { filePath, language, provider = 'azure' }) {
    jobs.set(jobId, {
        status: JobStatus.QUEUED,
        filePath,
        language,
        provider,
        createdAt: Date.now(),
    });
}

function get(jobId) {
    return jobs.get(jobId) || null;
}

function update(jobId, patch) {
    const job = jobs.get(jobId);
    if (!job) return;
    const isTerminalPatch = patch.status === JobStatus.COMPLETED || patch.status === JobStatus.FAILED;
    jobs.set(jobId, {
        ...job,
        ...patch,
        ...(isTerminalPatch && !job.completedAt ? { completedAt: Date.now() } : {}),
    });
}

function evictExpired() {
    const cutoff = Date.now() - JOB_TTL_MS;
    for (const [id, job] of jobs) {
        const isTerminal = job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED;
        const expiryBase = job.completedAt ?? job.createdAt;
        if (isTerminal && expiryBase < cutoff) {
            jobs.delete(id);
        }
    }
}

// Run cleanup on a background interval; unref() so it doesn't block process exit
const cleanupTimer = setInterval(evictExpired, JOB_CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

module.exports = { JobStatus, create, get, update };
