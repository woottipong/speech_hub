const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Converts any audio/video file to 16kHz, 16-bit, mono WAV.
 * @param {string} inputPath - Absolute path to the source file.
 * @returns {Promise<string>} - Absolute path to the output .wav file.
 */
function convertToWav(inputPath) {
    const outputPath = `${inputPath}.wav`;

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioChannels(1)        // Mono
            .audioFrequency(16000)   // 16 kHz
            .audioCodec('pcm_s16le') // 16-bit PCM — bitrate not applicable for PCM
            .format('wav')
            .on('error', (err) => {
                console.error('[converter] ffmpeg error:', err.message);
                reject(err);
            })
            .on('end', () => {
                // Remove original upload file after successful conversion
                fs.unlink(inputPath, (unlinkErr) => {
                    if (unlinkErr) console.warn('[converter] Could not delete input file:', unlinkErr.message);
                });
                resolve(outputPath);
            })
            .save(outputPath);
    });
}

module.exports = { convertToWav };
