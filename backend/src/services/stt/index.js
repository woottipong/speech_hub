const azureProvider = require('./azureProvider');
const googleProvider = require('./googleProvider');

const PROVIDERS = {
    azure: azureProvider,
    google: googleProvider,
};

/**
 * Returns the STT provider by name.
 * Falls back to azure if the requested provider is unknown.
 * @param {string} providerName - 'azure' | 'google'
 * @returns {{ transcribeToVtt: Function }}
 */
function getProvider(providerName) {
    const provider = PROVIDERS[providerName];
    if (!provider) {
        console.warn(`[stt] Unknown provider "${providerName}", falling back to azure`);
        return PROVIDERS.azure;
    }
    return provider;
}

module.exports = { getProvider };
