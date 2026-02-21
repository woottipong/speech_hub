import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../lib/constants';

const WS_URL = API_BASE.replace(/^http/, 'ws') + '/api/stt/realtime';

// Target sample rate Azure expects: 16kHz 16-bit mono PCM
const TARGET_SAMPLE_RATE = 16000;

/**
 * Converts a Float32Array of audio samples to a 16-bit PCM Int16Array.
 */
function float32ToPcm16(float32) {
    const pcm = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const clamped = Math.max(-1, Math.min(1, float32[i]));
        pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    return pcm;
}

/**
 * Hook for Azure Realtime STT via WebSocket + Web Audio API.
 *
 * Usage:
 *   const { isRecording, interimText, finalLines, error, start, stop } = useRealtimeStt({ language });
 */
export function useRealtimeStt({ language = 'th-TH' } = {}) {
    const [isRecording, setIsRecording] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [finalLines, setFinalLines] = useState([]);
    const [error, setError] = useState('');

    const wsRef = useRef(null);
    const audioCtxRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);
    // Prevents ws.onclose from double-running cleanup after stop() already did it
    const isStoppingRef = useRef(false);

    const cleanupAudio = useCallback(() => {
        processorRef.current?.disconnect();
        processorRef.current = null;

        if (audioCtxRef.current?.state !== 'closed') {
            audioCtxRef.current?.close();
        }
        audioCtxRef.current = null;

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }, []);

    const stop = useCallback(() => {
        isStoppingRef.current = true;

        // Tell Azure to flush remaining audio and fire final recognized events
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
            // Give Azure ~500ms to emit the last recognized event before closing
            setTimeout(() => {
                wsRef.current?.close();
                wsRef.current = null;
            }, 500);
        } else {
            wsRef.current = null;
        }

        cleanupAudio();
        setIsRecording(false);
        setInterimText('');
    }, [cleanupAudio]);

    const start = useCallback(async () => {
        setError('');
        setFinalLines([]);
        setInterimText('');
        isStoppingRef.current = false;

        // Get microphone access
        let micStream;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
            setError('Microphone access denied: ' + err.message);
            return;
        }
        streamRef.current = micStream;

        // Open WebSocket
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'start', language }));

            // Set up Web Audio pipeline: mic → ScriptProcessor → silent GainNode
            // Using a GainNode(0) instead of audioCtx.destination prevents mic audio
            // from playing through speakers and stops the processor cleanly on close.
            const audioCtx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
            audioCtxRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(micStream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            const silentGain = audioCtx.createGain();
            silentGain.gain.value = 0;

            processor.onaudioprocess = (e) => {
                if (ws.readyState !== WebSocket.OPEN) return;
                const float32 = e.inputBuffer.getChannelData(0);
                const pcm16 = float32ToPcm16(float32);
                ws.send(pcm16.buffer);
            };

            source.connect(processor);
            processor.connect(silentGain);
            silentGain.connect(audioCtx.destination);

            setIsRecording(true);
        };

        ws.onmessage = (e) => {
            let msg;
            try { msg = JSON.parse(e.data); } catch { return; }

            if (msg.type === 'recognizing') {
                setInterimText(msg.text);
            } else if (msg.type === 'recognized') {
                setFinalLines((prev) => [...prev, msg.text]);
                setInterimText('');
            } else if (msg.type === 'error') {
                setError(msg.message);
                cleanupAudio();
                setIsRecording(false);
            } else if (msg.type === 'stopped') {
                setInterimText('');
            }
        };

        ws.onerror = () => {
            setError('WebSocket connection error. Is the backend running?');
            cleanupAudio();
            setIsRecording(false);
        };

        ws.onclose = () => {
            // Only run cleanup if stop() hasn't already handled it
            if (!isStoppingRef.current) {
                cleanupAudio();
                setIsRecording(false);
            }
            isStoppingRef.current = false;
        };
    }, [language, cleanupAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isStoppingRef.current = true;
            wsRef.current?.close();
            cleanupAudio();
        };
    }, [cleanupAudio]);

    return { isRecording, interimText, finalLines, error, start, stop };
}
