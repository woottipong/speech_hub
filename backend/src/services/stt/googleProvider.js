const path = require('path');
const { randomUUID } = require('crypto');
const { SpeechClient } = require('@google-cloud/speech').v2;
const { Storage } = require('@google-cloud/storage');
const {
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_CLOUD_PROJECT,
    STT_LOCATION,
    GOOGLE_CLOUD_STORAGE_BUCKET,
    STT_RECOGNIZER,
    STT_MODEL,
} = require('../../config');

function buildClientOptions() {
    const opts = {};
    if (GOOGLE_APPLICATION_CREDENTIALS) {
        opts.keyFilename = GOOGLE_APPLICATION_CREDENTIALS;
    }
    return opts;
}

// Singleton clients — initialized once per process
let _storageClient = null;
let _speechClient = null;

function getStorageClient() {
    if (!_storageClient) {
        _storageClient = new Storage(buildClientOptions());
    }
    return _storageClient;
}

function getSpeechClient() {
    if (!_speechClient) {
        const opts = buildClientOptions();
        if (STT_LOCATION && STT_LOCATION !== 'global') {
            opts.apiEndpoint = `${STT_LOCATION}-speech.googleapis.com`;
        }
        _speechClient = new SpeechClient(opts);
    }
    return _speechClient;
}

/**
 * Uploads a local file to GCS and returns the gs:// URI.
 * @param {string} localPath
 * @returns {Promise<{ gcsUri: string, gcsFile: object }>}
 */
async function uploadToGcs(localPath) {
    const storage = getStorageClient();
    const bucket = storage.bucket(GOOGLE_CLOUD_STORAGE_BUCKET);
    const destName = `speech-hub-tmp/${randomUUID()}${path.extname(localPath)}`;
    const gcsFile = bucket.file(destName);

    console.log(`[google] Uploading to GCS: gs://${GOOGLE_CLOUD_STORAGE_BUCKET}/${destName}`);
    await bucket.upload(localPath, { destination: destName });

    return {
        gcsUri: `gs://${GOOGLE_CLOUD_STORAGE_BUCKET}/${destName}`,
        gcsFile,
    };
}

/**
 * Downloads text content from a GCS URI.
 * @param {string} gcsUri
 * @returns {Promise<string>}
 */
async function downloadTextFromGcs(gcsUri) {
    if (!gcsUri.startsWith('gs://')) throw new Error('Invalid GCS URI');
    const pathPart = gcsUri.replace('gs://', '');
    const bucketName = pathPart.split('/')[0];
    const blobName = pathPart.split('/').slice(1).join('/');

    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(blobName);
    
    const [contents] = await file.download();
    return contents.toString('utf8');
}

/**
 * Deletes all objects under a GCS prefix.
 * @param {string} bucketName
 * @param {string} prefix
 */
async function deleteGcsPrefix(bucketName, prefix) {
    try {
        const storage = getStorageClient();
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({ prefix });
        await Promise.all(files.map((f) => f.delete()));
        console.log(`[google] Cleaned up GCS prefix: gs://${bucketName}/${prefix}`);
    } catch (err) {
        console.warn(`[google] Failed to cleanup GCS prefix ${prefix}:`, err.message);
    }
}

/**
 * Transcribes a WAV file using Google Cloud Speech-to-Text v2 batchRecognize with Chirp.
 * Uploads the WAV to GCS temporarily, runs batch recognition, then deletes the GCS file.
 * @param {string} wavPath - Absolute path to 16kHz mono WAV file.
 * @param {string} [language='th-TH'] - BCP-47 language code.
 * @returns {Promise<string>} - WebVTT formatted string.
 */

async function transcribeToVtt(wavPath, language = 'th-TH') {
    if (!GOOGLE_CLOUD_PROJECT) throw new Error('GOOGLE_CLOUD_PROJECT is not set');
    if (!GOOGLE_CLOUD_STORAGE_BUCKET) throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET is not set');

    const client = getSpeechClient();

    const { gcsUri, gcsFile } = await uploadToGcs(wavPath);

    const taskId = randomUUID();
    const outputPrefix = `vtt/${taskId}/`;
    const gcsOutputUri = `gs://${GOOGLE_CLOUD_STORAGE_BUCKET}/${outputPrefix}`;

    let vttContent = null;
    try {
        const recognizer = `projects/${GOOGLE_CLOUD_PROJECT}/locations/${STT_LOCATION}/recognizers/${STT_RECOGNIZER}`;

        const request = {
            recognizer,
            config: {
                languageCodes: [language],
                model: STT_MODEL,
                autoDecodingConfig: {},
                features: {
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: true,
                }
            },
            files: [{ uri: gcsUri }],
            recognitionOutputConfig: {
                gcsOutputConfig: {
                    uri: gcsOutputUri,
                },
                outputFormatConfig: {
                    vtt: {}
                }
            },
        };

        console.log(`[google] Starting batchRecognize (Model: ${STT_MODEL}, Lang: ${language})`);
        
        const [operation] = await client.batchRecognize(request);

        console.log('[google] Waiting for operation to complete...');
        const [response] = await operation.promise();

        // Get VTT URI from response
        let vttGcsUri = null;
        if (response.results) {
            const resultsValues = Object.values(response.results);
            for (const fileResult of resultsValues) {
                if (fileResult.cloudStorageResult && fileResult.cloudStorageResult.vttFormatUri) {
                    vttGcsUri = fileResult.cloudStorageResult.vttFormatUri;
                    break;
                }
            }
        }

        if (!vttGcsUri) {
            throw new Error('No VTT file generated by Google STT');
        }

        console.log(`[google] Downloading VTT from ${vttGcsUri}`);
        vttContent = await downloadTextFromGcs(vttGcsUri);

        // Clean up VTT output only after successful download
        await deleteGcsPrefix(GOOGLE_CLOUD_STORAGE_BUCKET, outputPrefix);

        return vttContent;
    } finally {
        // Always delete the temp audio file regardless of success or failure
        try {
            await gcsFile.delete();
            console.log('[google] Temp GCS audio file deleted');
        } catch (err) {
            console.warn('[google] Failed to delete temp GCS audio file:', err.message);
        }
    }
}

module.exports = { transcribeToVtt };
