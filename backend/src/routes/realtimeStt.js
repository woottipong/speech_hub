'use strict';

const { createRealtimeSession } = require('../services/realtimeSttService');

const WS_PATH = '/api/stt/realtime';
const MAX_CONTROL_MESSAGE_BYTES = 8 * 1024;
const MAX_AUDIO_CHUNK_BYTES = 256 * 1024;
const ALLOWED_CONTROL_TYPES = new Set(['start', 'stop']);
const LANGUAGE_CODE_REGEX = /^[a-z]{2,3}-[A-Z]{2}$/;

/**
 * Attaches a WebSocket upgrade handler to an existing HTTP server.
 * Protocol:
 *   Client → Server : binary frames (PCM 16kHz 16-bit mono chunks)
 *   Client → Server : text frame JSON { type: 'start', language: 'th-TH' }  (must be first message)
 *   Client → Server : text frame JSON { type: 'stop' }
 *
 *   Server → Client : { type: 'recognizing', text }   — interim result
 *   Server → Client : { type: 'recognized',  text }   — final result per utterance
 *   Server → Client : { type: 'error',        message }
 *   Server → Client : { type: 'stopped' }
 *
 * @param {import('http').Server} httpServer
 * @param {import('ws').WebSocketServer} wss
 */
function attachRealtimeStt(httpServer, wss) {
    httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (url.pathname !== WS_PATH) return;

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', (ws) => {
        console.log('[realtimeStt] Client connected');

        let session = null;

        const send = (obj) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(obj));
            }
        };

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                if (!session) {
                    send({ type: 'error', message: 'Send start control message before audio chunks.' });
                    return;
                }
                if (data.length > MAX_AUDIO_CHUNK_BYTES) {
                    send({ type: 'error', message: 'Audio chunk too large.' });
                    return;
                }
                // Raw PCM audio chunk — forward to Azure
                session.pushChunk(data);
                return;
            }

            if (data.length > MAX_CONTROL_MESSAGE_BYTES) {
                send({ type: 'error', message: 'Control message too large.' });
                return;
            }

            // Text control message
            let msg;
            try {
                msg = JSON.parse(data.toString());
            } catch {
                send({ type: 'error', message: 'Invalid JSON control message.' });
                return;
            }

            if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
                send({ type: 'error', message: 'Invalid control message format.' });
                return;
            }

            if (!ALLOWED_CONTROL_TYPES.has(msg.type)) {
                send({ type: 'error', message: `Unsupported control type: ${msg.type}` });
                return;
            }

            if (msg.type === 'start') {
                if (session) {
                    send({ type: 'error', message: 'Session already active.' });
                    return;
                }

                const language = msg.language || 'th-TH';
                if (!LANGUAGE_CODE_REGEX.test(language)) {
                    send({ type: 'error', message: 'Invalid language code. Expected format like th-TH.' });
                    return;
                }

                session = createRealtimeSession({
                    language,
                    onRecognizing: (text) => send({ type: 'recognizing', text }),
                    onRecognized: (text) => send({ type: 'recognized', text }),
                    onError: (err) => {
                        console.error('[realtimeStt]', err.message);
                        send({ type: 'error', message: err.message });
                        session = null;
                    },
                    onSessionStopped: () => {
                        send({ type: 'stopped' });
                        session = null;
                    },
                });
            } else if (msg.type === 'stop') {
                if (!session) {
                    send({ type: 'error', message: 'No active session to stop.' });
                    return;
                }
                session.stop();
                session = null;
            }
        });

        ws.on('close', () => {
            console.log('[realtimeStt] Client disconnected');
            session?.stop();
            session = null;
        });

        ws.on('error', (err) => {
            console.error('[realtimeStt] WebSocket error:', err.message);
            session?.stop();
            session = null;
        });
    });
}

module.exports = { attachRealtimeStt, WS_PATH };
