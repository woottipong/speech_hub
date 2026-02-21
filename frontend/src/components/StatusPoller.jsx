import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock, FileAudio, Wand2, FileText } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { API_BASE } from '../lib/constants';
import AnimatedProcessing from './AnimatedProcessing';

const POLL_INTERVAL_MS = 2000;

const PROVIDER_LABELS = {
    azure: { label: 'ถอดความด้วย Azure AI', desc: 'Azure Cognitive Services กำลังวิเคราะห์เสียงและสร้างข้อความ' },
    google: { label: 'ถอดความด้วย Google AI', desc: 'Google Chirp 2 กำลังวิเคราะห์เสียงและสร้างข้อความ' },
};

function buildSteps(provider) {
    const transcribeLabel = PROVIDER_LABELS[provider] || PROVIDER_LABELS.azure;
    return [
        {
            key: 'queued',
            label: 'รอในคิว',
            desc: 'งานถูกรับแล้ว กำลังรอเริ่มประมวลผล',
            icon: Clock,
            color: 'text-purple-400',
            border: 'border-purple-500/30',
            bg: 'bg-purple-500/10',
        },
        {
            key: 'converting',
            label: 'แปลงไฟล์เสียง',
            desc: 'FFmpeg กำลังแปลงไฟล์เป็น WAV 16kHz mono',
            icon: FileAudio,
            color: 'text-amber-400',
            border: 'border-amber-500/30',
            bg: 'bg-amber-500/10',
        },
        {
            key: 'transcribing',
            label: transcribeLabel.label,
            desc: transcribeLabel.desc,
            icon: Wand2,
            color: 'text-cyan-400',
            border: 'border-cyan-500/30',
            bg: 'bg-cyan-500/10',
        },
        {
            key: 'done',
            label: 'สร้าง VTT สำเร็จ',
            desc: 'ถอดความเสร็จสมบูรณ์ กำลังโหลดผลลัพธ์...',
            icon: FileText,
            color: 'text-emerald-400',
            border: 'border-emerald-500/30',
            bg: 'bg-emerald-500/10',
        },
    ];
}

function getStepIndex(status, step) {
    if (status === 'queued') return 0;
    if (status === 'processing' && step === 'converting') return 1;
    if (status === 'processing' && step === 'transcribing') return 2;
    if (status === 'completed') return 3;
    return 0;
}

function useElapsedTimer(active) {
    const [elapsed, setElapsed] = useState(0);
    const startRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (active) {
            startRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [active]);

    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    return `${mm}:${ss}`;
}

function useEtaCountdown(step, etaSec, transcribeStartedAt) {
    const [remainingSec, setRemainingSec] = useState(null);
    const etaTimerRef = useRef(null);

    useEffect(() => {
        if (step === 'transcribing' && etaSec !== null && transcribeStartedAt !== null) {
            const tick = () => {
                const elapsed = (Date.now() - transcribeStartedAt) / 1000;
                const remaining = Math.max(0, Math.ceil(etaSec - elapsed));
                setRemainingSec(remaining);
            };
            tick();
            etaTimerRef.current = setInterval(tick, 1000);
        } else {
            clearInterval(etaTimerRef.current);
        }

        return () => clearInterval(etaTimerRef.current);
    }, [step, etaSec, transcribeStartedAt]);

    return remainingSec;
}

function useJobStatusPolling(jobId, onCompleteRef, onErrorRef) {
    const [status, setStatus] = useState('queued');
    const [step, setStep] = useState('');
    const [provider, setProvider] = useState('azure');
    const [etaSec, setEtaSec] = useState(null);
    const [transcribeStartedAt, setTranscribeStartedAt] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!jobId) return;

        const poll = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/status/${jobId}`);
                setStatus(data.status);
                setStep(data.step || '');
                if (data.provider !== undefined) setProvider(data.provider);
                if (data.etaSec !== undefined) setEtaSec(data.etaSec);
                if (data.transcribeStartedAt !== undefined) setTranscribeStartedAt(data.transcribeStartedAt);

                if (data.status === 'completed') {
                    clearInterval(intervalRef.current);
                    onCompleteRef.current(data.vtt);
                } else if (data.status === 'failed') {
                    clearInterval(intervalRef.current);
                    onErrorRef.current(data.error || 'Failed to process job. Please try again.');
                }
            } catch {
                clearInterval(intervalRef.current);
                onErrorRef.current('Lost connection to status check.');
            }
        };

        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [jobId, onCompleteRef, onErrorRef]);

    return { status, step, provider, etaSec, transcribeStartedAt };
}

export default function StatusPoller({ jobId, onComplete, onError }) {
    const onCompleteRef = useRef(onComplete);
    const onErrorRef = useRef(onError);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const { status, step, provider, etaSec, transcribeStartedAt } = useJobStatusPolling(jobId, onCompleteRef, onErrorRef);
    const remainingSec = useEtaCountdown(step, etaSec, transcribeStartedAt);

    const isActive = status === 'queued' || status === 'processing';
    const elapsed = useElapsedTimer(isActive);

    const STEPS = useMemo(() => buildSteps(provider), [provider]);
    const currentIdx = getStepIndex(status, step);
    const currentStep = STEPS[currentIdx];
    const Icon = currentStep.icon;

    if (status === 'failed') {
        return (
            <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-sm text-rose-200 bg-rose-500/10 px-5 py-4 rounded-xl border border-rose-500/20 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                    <p className="font-bold">เกิดข้อผิดพลาด</p>
                    <p className="text-xs text-rose-300/70 mt-0.5">กรุณาลองใหม่อีกครั้ง</p>
                </div>
            </Motion.div>
        );
    }

    return (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 border-white/5 bg-white/[0.03] flex flex-col md:flex-row gap-6 relative overflow-hidden items-center md:items-stretch">

            {/* Left side: Animated Visualizer */}
            <div className="flex-shrink-0 flex items-center justify-center p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner relative z-10 w-full md:w-auto">
                <AnimatedProcessing step={status === 'completed' ? 'done' : (step || 'queued')} />
            </div>

            {/* Right side: Content */}
            <div className="flex-1 flex flex-col justify-center w-full space-y-5 relative z-10">
                {/* Current step header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border shadow-lg ${currentStep.bg} ${currentStep.border}`}>
                            {status === 'completed'
                                ? <CheckCircle2 className={`w-5 h-5 ${currentStep.color}`} />
                                : <Icon className={`w-5 h-5 ${currentStep.color} ${isActive ? 'animate-pulse' : ''}`} />
                            }
                        </div>
                        <div>
                            <AnimatePresence mode="wait">
                                <Motion.p key={currentStep.key}
                                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                                    className={`font-extrabold text-base tracking-wide ${currentStep.color}`}>
                                    {currentStep.label}
                                </Motion.p>
                            </AnimatePresence>
                            <AnimatePresence mode="wait">
                                <Motion.p key={currentStep.key + '-desc'}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-[13px] text-white/50 mt-1 leading-relaxed">
                                    {currentStep.desc}
                                </Motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ETA countdown or elapsed timer */}
                    <div className="flex flex-col items-end gap-1 shrink-0 bg-black/30 px-3 py-2 rounded-lg border border-white/5 hidden sm:flex">
                        {step === 'transcribing' && remainingSec !== null && remainingSec > 0 ? (
                            <>
                                <div className="flex items-center gap-1.5 text-cyan-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="font-mono text-sm tabular-nums font-bold">
                                        ~{remainingSec < 60
                                            ? `${remainingSec}s`
                                            : `${Math.floor(remainingSec / 60)}m ${remainingSec % 60}s`}
                                    </span>
                                </div>
                                <span className="text-[10px] text-cyan-400/50 font-mono tracking-wider uppercase">Remaining</span>
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5 text-white/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-mono text-sm tabular-nums font-bold">{elapsed}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step pipeline */}
                <div className="flex items-center gap-1.5">
                    {STEPS.map((s, i) => {
                        const isDone = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        const isPending = i > currentIdx;
                        return (
                            <div key={s.key} className="flex items-center gap-1.5 flex-1 min-w-0">
                                <div className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold truncate flex-1
                                    transition-all duration-500
                                    ${isDone ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : ''}
                                    ${isCurrent ? `${s.bg} ${s.color} border ${s.border} shadow-[0_0_15px_rgba(inherit,0.2)]` : ''}
                                    ${isPending ? 'bg-white/[0.02] text-white/20 border border-white/5' : ''}
                                `}>
                                    {isDone
                                        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                                        : isCurrent
                                            ? <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                                            : <div className="w-3 h-3 rounded-full border border-current shrink-0 opacity-40" />
                                    }
                                    <span className="truncate hidden sm:inline">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`w-3 h-1 rounded-full shrink-0 transition-colors duration-500 ${i < currentIdx ? 'bg-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white/10'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Job ID */}
                <p className="text-[10px] text-white/20 font-mono">Job: {jobId.split('-')[0]}…</p>
            </div>
        </Motion.div>
    );
}
