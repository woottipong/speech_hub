import { useState, useRef } from 'react';
import { Play, Square, Loader2, Bot, MessageSquare, Volume2, Sparkles, AlertCircle, ChevronDown, Cloud, Radio, Zap } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { API_BASE, TTS_VOICE_GROUPS, ALL_TTS_VOICES, STYLE_LABELS, TTS_MAX_CHARS } from '../lib/constants';

const GENDER_ICON = { Female: '♀', Male: '♂' };

const TTS_PROVIDERS = [
    { value: 'azure', label: 'Azure Neural', icon: Bot, isAvailable: true, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', activeShadow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
    { value: 'google', label: 'Google Cloud', icon: Cloud, isAvailable: false, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', activeShadow: '' },
    { value: 'elevenlabs', label: 'ElevenLabs', icon: Radio, isAvailable: false, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', activeShadow: '' },
];

async function fetchPreviewAudio(voiceValue, previewText) {
    const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, voice: voiceValue, style: '' }),
    });
    if (!res.ok) throw new Error('Preview failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

export default function TTSPage() {
    const [text, setText] = useState('');
    const [provider, setProvider] = useState('azure');
    const [voice, setVoice] = useState(TTS_VOICE_GROUPS[0].voices[0].value);
    const [style, setStyle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [previewingVoice, setPreviewingVoice] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const audioRef = useRef(null);
    const prevAudioUrlRef = useRef('');
    const previewAudioRef = useRef(null);
    const prevPreviewUrlRef = useRef('');

    const selectedVoiceMeta = ALL_TTS_VOICES.find((v) => v.value === voice);
    const availableStyles = selectedVoiceMeta?.styles ?? [];

    const handlePreview = async (e, v) => {
        e.stopPropagation();
        if (previewingVoice === v.value) {
            // Stop current preview
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current.src = "";
            }
            setPreviewingVoice('');
            setIsPreviewMode(false);
            return;
        }

        // Stop any existing before starting new
        if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current.src = "";
        }

        setPreviewingVoice(v.value);
        setIsPreviewMode(true);
        try {
            const url = await fetchPreviewAudio(v.value, v.preview);
            if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
            prevPreviewUrlRef.current = url;
            const audio = new Audio(url);
            previewAudioRef.current = audio;
            audio.onended = () => { setPreviewingVoice(''); setIsPreviewMode(false); };
            audio.onerror = () => { setPreviewingVoice(''); setIsPreviewMode(false); };
            await audio.play();
        } catch {
            setPreviewingVoice('');
            setIsPreviewMode(false);
        }
    };

    const handleVoiceChange = (newVoice) => {
        setVoice(newVoice);
        // Reset style if new voice doesn't support current style
        const meta = ALL_TTS_VOICES.find((v) => v.value === newVoice);
        if (!meta?.styles.includes(style)) setStyle('');
    };

    const handleSpeak = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch(`${API_BASE}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), voice, style }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Server error ${res.status}`);
            }

            const blob = await res.blob();

            if (prevAudioUrlRef.current) URL.revokeObjectURL(prevAudioUrlRef.current);
            const url = URL.createObjectURL(blob);
            prevAudioUrlRef.current = url;
            setAudioUrl(url);

            setTimeout(() => audioRef.current?.play(), 100);
        } catch (err) {
            setErrorMsg(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const charCount = text.length;

    return (
        <div className="w-full space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Vocal Synthesis
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1.5">
                        Transform your text into lifelike Thai speech with emotional depth.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-lobe hidden sm:inline-flex">React Studio</span>
                    <span className="premium-badge badge-azure">Azure Neural</span>
                </div>
            </div>

            <div className="glass-panel p-5 md:p-6 lg:p-8 space-y-6 lg:space-y-8 relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-6">
                        {/* ── Engine Provider Row ── */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                <Zap className="w-3 h-3 text-yellow-400" /> Synthesis Engine
                            </label>
                            <div className="flex gap-2 p-1.5 glass-panel rounded-2xl border-white/5 bg-[#0a0d14] overflow-x-auto custom-scrollbar">
                                {TTS_PROVIDERS.map((p) => {
                                    const isActive = provider === p.value;
                                    const Icon = p.icon;
                                    return (
                                        <button
                                            key={p.value}
                                            onClick={() => p.isAvailable && setProvider(p.value)}
                                            disabled={!p.isAvailable || isLoading}
                                            className={`
                                                relative flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300
                                                ${isActive ? `${p.bg} border ${p.border} ${p.activeShadow}` : 'border border-transparent hover:bg-[#151a26]'}
                                                ${!p.isAvailable ? 'opacity-40 cursor-not-allowed hidden sm:flex' : ''}
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? p.color : 'text-white/40'}`} />
                                            <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-white' : 'text-white/60'}`}>
                                                {p.label}
                                            </span>
                                            {!p.isAvailable && (
                                                <span className="absolute -top-1.5 -right-1.5 bg-black/80 text-[8px] border border-white/10 px-1.5 py-0.5 rounded-full font-mono text-white/50 tracking-white">
                                                    Soon
                                                </span>
                                            )}
                                            {isActive && (
                                                <Motion.div layoutId="provider-highlight" className={`absolute inset-0 rounded-xl border-2 ${p.border} opacity-50 pointer-events-none`} transition={{ duration: 0.3 }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Voice Selection ── */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                <Volume2 className="w-3 h-3" /> Select Voice
                            </label>

                            <div className="h-[280px] overflow-y-auto custom-scrollbar pr-2 space-y-4 rounded-xl border border-white/5 bg-[#0a0d14] p-3 shadow-inner">
                                {TTS_VOICE_GROUPS.map((group) => (
                                    <div key={group.group} className="space-y-2">
                                        <div className="sticky top-0 bg-[#0a0d14] z-10 py-1 -mx-2 px-2 -mt-2 mb-2 border-b border-white/5 shadow-sm">
                                            <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-[0.3em]">{group.group}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {group.voices.map((v) => {
                                                const isActive = voice === v.value;
                                                const isPlayingPreview = previewingVoice === v.value;
                                                return (
                                                    <div
                                                        key={v.value}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => handleVoiceChange(v.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                handleVoiceChange(v.value);
                                                            }
                                                        }}
                                                        className={`
                                                        group flex items-center justify-between p-2 rounded-lg border
                                                        transition-all duration-300 cursor-pointer select-none relative overflow-hidden
                                                        ${isActive
                                                                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_4px_15px_rgba(168,85,247,0.15)] scale-[1.01]'
                                                                : 'bg-[#151a26] border-white/5 hover:border-white/20 hover:bg-[#1d2433] hover:scale-[1.01]'}
                                                    `}
                                                    >
                                                        {/* Active Glow Behind */}
                                                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-50 pointer-events-none" />}

                                                        <div className="flex items-center gap-2 min-w-0 relative z-10">
                                                            {/* Avatar / Icon */}
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-[#0a0d14] border-white/10 group-hover:border-white/30'}`}>
                                                                {isPlayingPreview ? (
                                                                    <div className="flex items-end gap-[1px] w-3 h-3 justify-center">
                                                                        <Motion.div className="w-0.5 bg-purple-400 rounded-full" animate={{ height: ["20%", "100%", "30%", "80%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
                                                                        <Motion.div className="w-0.5 bg-purple-400 rounded-full" animate={{ height: ["60%", "20%", "90%", "40%", "70%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0.1 }} />
                                                                        <Motion.div className="w-0.5 bg-purple-400 rounded-full" animate={{ height: ["40%", "80%", "20%", "100%", "50%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0.2 }} />
                                                                    </div>
                                                                ) : (
                                                                    <span className={`text-[10px] font-bold ${v.gender === 'Female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                                                        {GENDER_ICON[v.gender]}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Text Info */}
                                                            <div className="min-w-0 flex items-center gap-2">
                                                                <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                                                                    {v.label}
                                                                </p>
                                                                <p className="text-[10px] text-white/30 font-medium truncate hidden sm:block">· {v.desc}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0 relative z-10">
                                                            {v.styles.length > 0 && (
                                                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 hidden md:block">
                                                                    {v.styles.length} styles
                                                                </span>
                                                            )}
                                                            {/* Preview Play/Stop Button */}
                                                            <button
                                                                onClick={(e) => handlePreview(e, v)}
                                                                title={isPlayingPreview ? "Stop Preview" : "Play Preview"}
                                                                className={`
                                                                    p-1.5 rounded-full border transition-all hover:scale-110 active:scale-95
                                                                    ${isPlayingPreview
                                                                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                                                                        : (isActive ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20')}
                                                                `}
                                                            >
                                                                {isPlayingPreview ? (
                                                                    <Square className="w-3 h-3 fill-current" />
                                                                ) : isPreviewMode && previewingVoice !== '' ? (
                                                                    <Loader2 className="w-3 h-3 opacity-30" />
                                                                ) : (
                                                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> {/* <-- Close Left Column */}

                    {/* ── Right Column: Text Input + Style + Actions ── */}
                    <div className="flex flex-col space-y-4 h-[100%]">
                        {/* Style selector — sits right above textarea, visible immediately */}
                        <AnimatePresence>
                            {availableStyles.length > 0 && (
                                <Motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                        <Sparkles className="w-3 h-3" /> Speaking Style
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full appearance-none bg-[#0a0d14] border border-white/10 text-white/80 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer hover:border-white/20"
                                        >
                                            <option value="" className="bg-[#0d0d14]">— Default (no style) —</option>
                                            {availableStyles.map((s) => (
                                                <option key={s} value={s} className="bg-[#0d0d14]">
                                                    {STYLE_LABELS[s] ?? s}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                    {style && (
                                        <p className="text-[10px] text-purple-300/60 px-1">
                                            Style <span className="font-bold text-purple-300">{STYLE_LABELS[style] ?? style}</span> will be applied via SSML
                                        </p>
                                    )}
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <label className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                <MessageSquare className="w-3 h-3" /> Input Script
                            </span>
                            <span className={`text-[10px] font-mono ${charCount > TTS_MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-white/30'}`}>
                                {charCount} / {TTS_MAX_CHARS}
                            </span>
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, TTS_MAX_CHARS))}
                            placeholder="พิมพ์หรือวางข้อความภาษาไทยที่นี่..."
                            className="w-full flex-1 min-h-[160px] rounded-xl bg-[#0a0d14] border border-white/5 text-sm p-4 resize-none transition-all placeholder:text-white/10 text-white/90 focus:outline-none focus:border-purple-500/50 custom-scrollbar leading-relaxed"
                        />

                        <div className="flex flex-col gap-3 mt-auto pt-2">
                            {/* Voice info pill & Error message */}
                            <div className="flex items-center justify-between min-h-[24px]">
                                {selectedVoiceMeta ? (
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono px-1">
                                        <span className={selectedVoiceMeta.gender === 'Female' ? 'text-pink-400/60' : 'text-blue-400/60'}>
                                            {GENDER_ICON[selectedVoiceMeta.gender]}
                                        </span>
                                        <span>{selectedVoiceMeta.value}</span>
                                        {style && <span className="text-purple-400/60">· {style}</span>}
                                    </div>
                                ) : <div />}

                                <AnimatePresence>
                                    {errorMsg && (
                                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex items-center gap-2 text-[11px] text-rose-300 font-semibold bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                            <AlertCircle className="w-3 h-3" /> {errorMsg}
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={handleSpeak}
                                disabled={!text.trim() || isLoading}
                                className="w-full primary-button flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing Audio...</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Synthesize & Play</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {audioUrl && (
                        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <Volume2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{selectedVoiceMeta?.label ?? 'Generated Stream'}</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                                        {style ? `Style: ${style}` : 'Default style'} · MP3 · 16KHz
                                    </p>
                                </div>
                            </div>
                            <audio ref={audioRef} src={audioUrl} controls className="flex-1 w-full h-10 outline-none opacity-80 hover:opacity-100 transition-opacity" />
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
