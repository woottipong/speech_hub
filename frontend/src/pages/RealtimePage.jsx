import { useState } from 'react';
import { Mic, Square, Bot, Zap, AlertCircle, Copy, Check, Radio, Settings2, FileAudio } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { useRealtimeStt } from '../hooks/useRealtimeStt';
import LanguageSelector from '../components/LanguageSelector';

export default function RealtimePage() {
    const [language, setLanguage] = useState('th-TH');
    const [copied, setCopied] = useState(false);

    const { isRecording, interimText, finalLines, error, start, stop } = useRealtimeStt({ language });

    const handleToggle = () => {
        if (isRecording) {
            stop();
        } else {
            start();
        }
    };

    const fullTranscript = finalLines.join('\n');

    const handleCopy = () => {
        if (!fullTranscript) return;
        navigator.clipboard.writeText(fullTranscript).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pt-1 pb-12 px-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Radio className="w-6 h-6 text-purple-400" />
                        Realtime Transcription
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1.5">
                        Speak directly into your microphone for instant text processing.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-ffmpeg hidden sm:inline-flex"><Zap className="w-3 h-3" /> WebSocket Stream</span>
                    <span className="premium-badge badge-azure"><Bot className="w-3 h-3" /> Azure Realtime</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
                {/* ── LEFT: Main Transcript Area ── */}
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    <div className="glass-panel p-6 lg:p-8 flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0a0d14]/60 border-white/5 shadow-2xl">
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <FileAudio className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Live Transcript</span>
                            </div>
                            {fullTranscript && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-all"
                                >
                                    {copied
                                        ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                                        : <><Copy className="w-3 h-3" /> Copy Text</>
                                    }
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10">
                            {/* Live transcript panel */}
                            <div className="space-y-3 min-h-[160px]">
                                {/* Final lines */}
                                {finalLines.map((line, i) => (
                                    <Motion.p
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-white/90 text-lg leading-relaxed"
                                    >
                                        {line}
                                    </Motion.p>
                                ))}

                                {/* Interim (in-progress) text */}
                                {interimText && (
                                    <p className="text-white/40 text-lg leading-relaxed italic">
                                        {interimText}
                                    </p>
                                )}

                                {/* Placeholder when empty */}
                                {finalLines.length === 0 && !interimText && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 mt-12">
                                        <Mic className="w-12 h-12 mb-4 text-purple-400" />
                                        <p className="text-sm font-medium italic">Waiting for speech...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Actions (Mic Button) */}
                        <div className="flex flex-col gap-4 shrink-0 mt-6 pt-6 border-t border-white/5 relative z-10">
                            <AnimatePresence>
                                {error && (
                                    <Motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-2 text-[10px] text-rose-300 font-bold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mx-2">
                                        <AlertCircle className="w-3.5 h-3.5" /> {error}
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleToggle}
                                className={`w-full group relative flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[11px] tracking-[0.4em] transition-all overflow-hidden shadow-xl
                                    ${isRecording
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                                        : 'text-white hover:scale-[1.01] active:scale-[0.99] border border-white/10'
                                    }`}
                                style={isRecording ? {} : { background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
                            >
                                {isRecording ? (
                                    <><Square className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> STOP RECORDING</>
                                ) : (
                                    <><Mic className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> START RECORDING</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Settings Sidebar ── */}
                <div className="lg:w-[360px] flex flex-col min-h-0 space-y-6 shrink-0">
                    <div className="glass-panel p-6 flex-1 flex flex-col min-h-0 overflow-hidden relative">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/5 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <Settings2 className="w-5 h-5 text-purple-400" />
                            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">STT Settings</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-6 z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Spoken Language</p>
                                <LanguageSelector value={language} onChange={setLanguage} disabled={isRecording} />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Connection Status</p>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/50">State</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                                            <span className={`text-xs font-bold ${isRecording ? 'text-emerald-400' : 'text-white/40'}`}>
                                                {isRecording ? 'LISTENING' : 'IDLE'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/50">Engine</span>
                                        <span className="text-xs font-bold text-white/80">Azure Cognitive</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/50">Protocol</span>
                                        <span className="text-xs font-mono text-white/60">wss://</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
