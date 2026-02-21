const fs = require('fs');

const jobStore = require('../jobs/jobStore');
const { convertToWav } = require('../services/converter');
const { getProvider } = require('../services/stt');
const { estimateProcessingTimeSec } = require('../services/stt/eta');

/**
 * Background worker: convert → transcribe → update job store → cleanup
 * @param {string} jobId
 */
async function process(jobId) {
    const job = jobStore.get(jobId);
    if (!job) return;

    let wavPath = null;

    try {
        jobStore.update(jobId, { status: 'processing', step: 'converting' });
        console.log(`[worker] Job ${jobId} — converting to WAV...`);

        wavPath = await convertToWav(job.filePath);
        console.log(`[worker] Job ${jobId} — WAV ready, starting STT (provider: ${job.provider})...`);

        // Calculate ETA from WAV file size
        const wavSize = fs.statSync(wavPath).size;
        const providerName = job.provider || 'azure';
        const etaSec = Math.ceil(estimateProcessingTimeSec(providerName, wavSize));
        const transcribeStartedAt = Date.now();

        jobStore.update(jobId, {
            status: 'processing',
            step: 'transcribing',
            etaSec,
            transcribeStartedAt,
        });

        const provider = getProvider(providerName);
        const vtt = await provider.transcribeToVtt(wavPath, job.language);
        console.log(`[worker] Job ${jobId} — completed.`);

        jobStore.update(jobId, { status: 'completed', step: 'done', vtt });
    } catch (err) {
        console.error(`[worker] Job ${jobId} — failed:`, err.message);
        jobStore.update(jobId, { status: 'failed', error: err.message });
    } finally {
        // Clean up WAV temp file regardless of success or failure
        if (wavPath) {
            fs.unlink(wavPath, (unlinkErr) => {
                if (unlinkErr) console.warn('[worker] Could not delete WAV file:', unlinkErr.message);
            });
        }
    }
}

module.exports = { process };
