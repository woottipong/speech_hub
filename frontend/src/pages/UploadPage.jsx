import { useCallback, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Upload, Bot, Zap, AlertCircle, Settings2, FileAudio, Check } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import Dropzone from '../components/Dropzone';
import ProgressBar from '../components/ProgressBar';
import StatusPoller from '../components/StatusPoller';
import VttResultCard from '../components/VttResultCard';
import LanguageSelector from '../components/LanguageSelector';
import { API_BASE, Phase, STT_PROVIDERS } from '../lib/constants';

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [phase, setPhase] = useState(Phase.IDLE);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [jobId, setJobId] = useState(null);
    const [vtt, setVtt] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [language, setLanguage] = useState('th-TH');
    const [provider, setProvider] = useState('azure');

    const handleFileSelect = useCallback((f) => {
        setFile(f);
        setPhase(Phase.IDLE);
        setVtt('');
        setErrorMsg('');
        setJobId(null);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setPhase(Phase.UPLOADING);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        formData.append('provider', provider);

        try {
            const { data } = await axios.post(`${API_BASE}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
                },
            });
            setJobId(data.jobId);
            setPhase(Phase.PROCESSING);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Upload failed. Please try again.');
            setPhase(Phase.ERROR);
        }
    };

    const handleComplete = useCallback((vttContent) => { setVtt(vttContent); setPhase(Phase.DONE); }, []);
    const handleError = useCallback((msg) => { setErrorMsg(msg); setPhase(Phase.ERROR); }, []);

    const reset = () => {
        setFile(null);
        setPhase(Phase.IDLE);
        setVtt('');
        setErrorMsg('');
        setJobId(null);
        setUploadProgress(0);
    };

    const downloadFilename = file?.name?.replace(/\.[^.]+$/, '') || 'transcript';

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pt-1 pb-12 px-1">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Upload className="w-6 h-6 text-cyan-400" />
                        Batch Transcription
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1.5">
                        Upload audio/video files to automatically extract high-accuracy VTT subtitles.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-ffmpeg hidden sm:inline-flex"><Zap className="w-3 h-3" /> FFmpeg Engine</span>
                    <span className="premium-badge badge-azure"><Bot className="w-3 h-3" /> {provider === 'azure' ? 'Azure STT' : 'Google STT'}</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
                {/* ── LEFT: Main Upload Area ── */}
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    <div className="glass-panel p-6 lg:p-8 flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0a0d14]/60 border-white/5 shadow-2xl">
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <FileAudio className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Media Input</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10">
                            <Dropzone onFileSelect={handleFileSelect} />

                            <AnimatePresence mode="popLayout">
                                {phase === Phase.UPLOADING && (
                                    <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <ProgressBar progress={uploadProgress} label={`Uploading ${file?.name}...`} />
                                    </Motion.div>
                                )}

                                {phase === Phase.PROCESSING && jobId && (
                                    <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <StatusPoller jobId={jobId} onComplete={handleComplete} onError={handleError} />
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {phase === Phase.DONE && vtt && (
                                    <VttResultCard vtt={vtt} filename={downloadFilename} />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 shrink-0 mt-6 pt-6 border-t border-white/5 relative z-10">
                            <AnimatePresence>
                                {phase === Phase.ERROR && (
                                    <Motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-2 text-[10px] text-rose-300 font-bold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mx-2">
                                        <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-end gap-3">
                                {file && phase === Phase.IDLE && (
                                    <button onClick={handleUpload} className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm transition-all overflow-hidden shadow-xl text-white hover:scale-[1.02] active:scale-[0.98] border border-white/10" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                                        <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Start Transcribing
                                    </button>
                                )}
                                {(phase === Phase.DONE || phase === Phase.ERROR) && (
                                    <button onClick={reset} className="w-full sm:w-auto glass-button flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/20 hover:bg-white/5">
                                        <RefreshCw className="w-4 h-4" /> Start Over
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Settings Sidebar ── */}
                <div className="lg:w-[360px] flex flex-col min-h-0 space-y-6 shrink-0">
                    <div className="glass-panel p-6 flex-1 flex flex-col min-h-0 overflow-hidden relative">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/5 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <Settings2 className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">STT Settings</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-6 z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Spoken Language</p>
                                <LanguageSelector value={language} onChange={setLanguage} />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Transcription Engine</p>
                                <div className="flex flex-col gap-3">
                                    {STT_PROVIDERS.map((p) => {
                                        const isActive = provider === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                onClick={() => setProvider(p.value)}
                                                disabled={phase !== Phase.IDLE}
                                                className={`
                                                    relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left
                                                    disabled:opacity-40 disabled:cursor-not-allowed
                                                    ${isActive ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_2px_10px_rgba(6,182,212,0.15)]' : 'bg-[#151a26]/50 border-transparent hover:border-white/10 hover:bg-[#1d2433]'}
                                                `}
                                            >
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-cyan-500/20 border-cyan-400' : 'bg-[#0a0d14] border-white/5'}`}>
                                                    <span className="text-[16px] leading-none">{p.icon}</span>
                                                </div>

                                                {/* Text */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                                                            {p.label}
                                                        </p>
                                                        {isActive && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                                                    </div>
                                                    <p className={`text-[10px] mt-0.5 truncate font-medium ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                                                        {p.subtitle}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
