import { useState } from 'react';
import { Mic, Square, Bot, Zap, AlertCircle, Copy, Check, Radio } from 'lucide-react';
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
        <div className="w-full space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Radio className="w-6 h-6 text-cyan-400" />
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

            {/* Control Panel */}
            <div className="glass-panel p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-full blur-[80px] pointer-events-none transition-colors duration-1000 ${isRecording ? 'bg-cyan-500/10' : 'bg-white/5'}`} />

                <div className="relative z-10 flex items-center gap-6">
                    {/* Mic button */}
                    <div className="relative shrink-0">
                        <button
                            onClick={handleToggle}
                            className={`
                                relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl
                                transition-all duration-300 outline-none
                                ${isRecording
                                    ? 'recording-active scale-105'
                                    : 'bg-[#151a26] border border-white/20 hover:bg-[#1d2433] hover:border-cyan-400/50'
                                }
                            `}
                        >
                            {isRecording
                                ? <Square className="w-6 h-6 fill-current" />
                                : <Mic className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]" />
                            }
                        </button>
                        {isRecording && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400/20 pointer-events-none" />
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <AnimatePresence mode="wait">
                            {isRecording ? (
                                <Motion.div key="rec" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Listening...</span>
                                </Motion.div>
                            ) : (
                                <Motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p className="text-[var(--text-muted)] text-sm font-medium">
                                        {finalLines.length > 0 ? 'Session ended — results below' : 'กดปุ่มไมค์เพื่อเริ่มถอดความ'}
                                    </p>
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-xs text-rose-200 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 font-medium">
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {error}
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Language selector */}
                    <div className="shrink-0">
                        <LanguageSelector value={language} onChange={setLanguage} />
                    </div>
                </div>
            </div>

            {/* Live transcript panel */}
            <AnimatePresence>
                {(isRecording || finalLines.length > 0) && (
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-8 space-y-4"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
                                <h3 className="font-bold text-white text-sm tracking-wide">
                                    {isRecording ? 'Live Transcript' : 'Transcript'}
                                </h3>
                            </div>
                            {fullTranscript && (
                                <button
                                    onClick={handleCopy}
                                    className="glass-button flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white transition-all"
                                >
                                    {copied
                                        ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                                        : <><Copy className="w-3.5 h-3.5" /> Copy</>
                                    }
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 min-h-[80px] max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                            {/* Final lines */}
                            {finalLines.map((line, i) => (
                                <Motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-white/90 text-sm leading-relaxed"
                                >
                                    {line}
                                </Motion.p>
                            ))}

                            {/* Interim (in-progress) text */}
                            {interimText && (
                                <p className="text-white/40 text-sm leading-relaxed italic">
                                    {interimText}
                                </p>
                            )}

                            {/* Placeholder when empty */}
                            {finalLines.length === 0 && !interimText && (
                                <p className="text-white/20 text-sm italic">Waiting for speech...</p>
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
