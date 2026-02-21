const PCM16_MONO_16KHZ_BYTES_PER_SECOND = 32000;

const PROVIDER_ETA_PROFILE = {
    azure: { processingRate: 1.0, bufferSec: 10, minSec: 15 },
    google: { processingRate: 2.5, bufferSec: 30, minSec: 45 },
};

function estimateAudioDurationSec(audioSizeBytes) {
    if (!Number.isFinite(audioSizeBytes) || audioSizeBytes <= 0) return 0;
    return audioSizeBytes / PCM16_MONO_16KHZ_BYTES_PER_SECOND;
}

function estimateProcessingTimeSec(providerName, audioSizeBytes) {
    const profile = PROVIDER_ETA_PROFILE[providerName] || PROVIDER_ETA_PROFILE.azure;
    const durationSec = estimateAudioDurationSec(audioSizeBytes);
    const processingSec = durationSec / profile.processingRate;
    return Math.max(processingSec + profile.bufferSec, profile.minSec);
}

module.exports = {
    estimateAudioDurationSec,
    estimateProcessingTimeSec,
};
