import { useCallback, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Upload, Bot, Zap, AlertCircle } from 'lucide-react';
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
        <div className="w-full space-y-8 pb-12">
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

            <div className="glass-panel p-8 space-y-8 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

                <Dropzone onFileSelect={handleFileSelect} />

                {/* STT Engine + Language — grouped row */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">STT Engine</p>
                        <LanguageSelector value={language} onChange={setLanguage} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {STT_PROVIDERS.map((p) => {
                            const isActive = provider === p.value;
                            return (
                                <button
                                    key={p.value}
                                    onClick={() => setProvider(p.value)}
                                    disabled={phase !== Phase.IDLE}
                                    className={`
                                        relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 text-left
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        ${isActive
                                            ? p.activeClass
                                            : 'border-white/5 bg-[#151a26] hover:border-white/10 hover:bg-[#1d2433]'}
                                    `}
                                >
                                    {/* Icon */}
                                    <span className="text-2xl shrink-0 leading-none">{p.icon}</span>

                                    {/* Text */}
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-white/40'}`}>
                                            {p.label}
                                        </p>
                                        <p className={`text-[11px] mt-0.5 truncate ${isActive ? 'text-white/50' : 'text-white/20'}`}>
                                            {p.subtitle}
                                        </p>
                                        {/* Feature tags */}
                                        <div className="flex gap-1.5 mt-2">
                                            {p.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${isActive ? p.tagClass : 'bg-white/5 text-white/20'}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <Motion.div
                                            layoutId="provider-dot"
                                            className={`absolute top-3 right-3 w-2 h-2 rounded-full ${p.dotClass}`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {phase === Phase.UPLOADING && (
                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                            <ProgressBar progress={uploadProgress} label={`Uploading ${file?.name}...`} />
                        </Motion.div>
                    )}

                    {phase === Phase.PROCESSING && jobId && (
                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                            <StatusPoller jobId={jobId} onComplete={handleComplete} onError={handleError} />
                        </Motion.div>
                    )}

                    {phase === Phase.ERROR && (
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 text-sm text-rose-200 bg-rose-500/10 px-6 py-4 rounded-xl border border-rose-500/20 font-medium">
                            <AlertCircle className="w-5 h-5 text-rose-400" /> {errorMsg}
                        </Motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    {file && phase === Phase.IDLE && (
                        <button onClick={handleUpload} className="primary-button flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 active:scale-95 transition-all">
                            <Upload className="w-4 h-4" /> Start Transcribing
                        </button>
                    )}
                    {(phase === Phase.DONE || phase === Phase.ERROR) && (
                        <button onClick={reset} className="glass-button flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white/70 hover:text-white transition-all">
                            <RefreshCw className="w-4 h-4" /> Start Over
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {phase === Phase.DONE && vtt && (
                    <VttResultCard vtt={vtt} filename={downloadFilename} />
                )}
            </AnimatePresence>
        </div>
    );
}
