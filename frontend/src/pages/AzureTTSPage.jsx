import { useState, useRef } from 'react';
import { Play, Square, Loader2, MessageSquare, Volume2, Sparkles, AlertCircle, ChevronDown, Wand2, Clock, Search, Check, Bot } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { API_BASE, TTS_VOICE_GROUPS, ALL_TTS_VOICES, STYLE_LABELS, TTS_MAX_CHARS } from '../lib/constants';
import { useTTS } from '../lib/TTSContext';

const getEstimateTime = (charCount) => {
    if (charCount === 0) return '0s';
    const estSeconds = Math.ceil((charCount / 20) + 0.5);
    if (estSeconds < 60) return `~${estSeconds}s`;
    const mins = Math.floor(estSeconds / 60);
    const secs = estSeconds % 60;
    return `~${mins}m ${secs}s`;
};

async function fetchPreviewAudio(voiceValue, previewText) {
    const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, voice: voiceValue, style: '', provider: 'azure' }),
    });
    if (!res.ok) throw new Error('Preview failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

export default function AzureTTSPage() {
    const { voice, setVoice, style, setStyle } = useTTS();

    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [previewingVoice, setPreviewingVoice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const audioRef = useRef(null);
    const prevAudioUrlRef = useRef('');
    const previewAudioRef = useRef(null);
    const prevPreviewUrlRef = useRef('');

    const filteredVoiceGroups = TTS_VOICE_GROUPS.map(group => ({
        ...group,
        voices: group.voices.filter(v => {
            const matchesSearch = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
            return matchesSearch && matchesGender;
        })
    })).filter(group => group.voices.length > 0);

    const selectedVoiceMeta = ALL_TTS_VOICES.find((v) => v.value === voice);
    const availableStyles = selectedVoiceMeta?.styles ?? [];

    const handlePreview = async (e, v) => {
        e.stopPropagation();
        if (previewingVoice === v.value) {
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current.src = '';
            }
            setPreviewingVoice('');
            return;
        }
        if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current.src = '';
        }
        setPreviewingVoice(v.value);
        try {
            const url = await fetchPreviewAudio(v.value, v.preview);
            if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
            prevPreviewUrlRef.current = url;
            const audio = new Audio(url);
            previewAudioRef.current = audio;
            audio.onended = () => setPreviewingVoice('');
            audio.onerror = () => setPreviewingVoice('');
            await audio.play();
        } catch {
            setPreviewingVoice('');
        }
    };

    const handleVoiceChange = (newVoice) => {
        setVoice(newVoice);
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
                body: JSON.stringify({ text: text.trim(), voice, style, provider: 'azure' }),
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

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pt-1 pb-12 px-1">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Bot className="w-6 h-6 text-cyan-400" />
                        Azure Neural TTS
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1.5">
                        High-definition voices with SSML styling support.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-azure"><Bot className="w-3 h-3" /> Microsoft Engine</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">

                {/* ── Script Editor ── */}
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    <div className="glass-panel p-6 lg:p-8 flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0a0d14]/60 border-white/5 shadow-2xl">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Input Script</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400/80 bg-emerald-400/5 px-3 py-1.5 rounded-md border border-emerald-400/10">
                                    <Clock className="w-3.5 h-3.5" /> ETA: {getEstimateTime(text.length)}
                                </div>
                                <span className={`text-xs font-mono font-bold ${text.length > TTS_MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-white/30'}`}>
                                    {text.length.toLocaleString()} / {TTS_MAX_CHARS.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, TTS_MAX_CHARS))}
                            placeholder="Type or paste your content to synthesize..."
                            className="flex-1 w-full bg-transparent border-none text-white/90 text-lg p-0 resize-none focus:outline-none custom-scrollbar leading-relaxed placeholder:text-white/10 z-10"
                            spellCheck="false"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4 shrink-0">
                        <AnimatePresence>
                            {errorMsg && (
                                <Motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 text-[10px] text-rose-300 font-bold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mx-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={handleSpeak}
                            disabled={!text.trim() || isLoading}
                            className={`w-full group relative flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all overflow-hidden shadow-xl
                                ${!text.trim() || isLoading
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                                    : 'text-white hover:scale-[1.02] active:scale-[0.98] border border-white/10'
                                }`}
                            style={!text.trim() || isLoading ? {} : { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing Audio...</>
                            ) : (
                                <><Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Synthesize Speech</>
                            )}
                        </button>

                        <AnimatePresence>
                            {audioUrl && (
                                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                        <Volume2 className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-white text-sm truncate">{selectedVoiceMeta?.label ?? 'Generated Stream'}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">
                                            Azure HD{style ? ` · ${style}` : ''}
                                        </p>
                                    </div>
                                    <audio ref={audioRef} src={audioUrl} controls className="h-10 max-w-[240px] outline-none opacity-80 hover:opacity-100 transition-opacity" />
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="lg:w-[360px] flex flex-col min-h-0 space-y-6 shrink-0">
                    <div className="glass-panel p-6 flex-1 flex flex-col min-h-0 overflow-hidden relative">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/5 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <Wand2 className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Voice Settings</span>
                        </div>

                        {/* Search & Filter */}
                        <div className="space-y-3 mb-4 shrink-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                                <input
                                    type="text" placeholder="Find voice..." value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                                {['All', 'Male', 'Female'].map(g => (
                                    <button key={g} onClick={() => setGenderFilter(g)}
                                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${genderFilter === g ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Voice List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 z-10 pb-4 pr-2">
                            {filteredVoiceGroups.map(group => (
                                <div key={group.group} className="space-y-3">
                                    <div className="flex items-center gap-2 sticky top-0 z-10 bg-[#0a0d14]/95 backdrop-blur-sm py-1">
                                        <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">{group.group}</p>
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.voices.map(v => {
                                            const isActive = voice === v.value;
                                            const isPlayingPreview = previewingVoice === v.value;
                                            return (
                                                <div key={v.value} onClick={() => handleVoiceChange(v.value)}
                                                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_2px_10px_rgba(6,182,212,0.15)]' : 'bg-[#151a26]/50 border-transparent hover:border-white/10 hover:bg-[#1d2433]'}`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-cyan-500/20 border-cyan-400' : 'bg-[#0a0d14] border-white/5 group-hover:border-white/20'}`}>
                                                            {isPlayingPreview ? (
                                                                <div className="flex items-end gap-[1.5px] w-3 h-3 justify-center">
                                                                    <Motion.div className="w-[2px] bg-cyan-400 rounded-full" animate={{ height: ['20%', '100%', '30%', '80%', '40%'] }} transition={{ duration: 0.5, repeat: Infinity }} />
                                                                    <Motion.div className="w-[2px] bg-cyan-400 rounded-full" animate={{ height: ['60%', '20%', '90%', '40%', '70%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                                                                    <Motion.div className="w-[2px] bg-cyan-400 rounded-full" animate={{ height: ['40%', '80%', '20%', '100%', '50%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                                                                </div>
                                                            ) : (
                                                                <span className={`text-[12px] ${v.gender === 'Female' ? 'text-pink-400' : 'text-blue-400'}`}>{v.gender === 'Female' ? '♀' : '♂'}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-white/70'}`}>{v.label}</p>
                                                                {isActive && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] text-white/30 font-medium truncate mt-0.5">{v.desc}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button onClick={(e) => handlePreview(e, v)}
                                                            className={`p-2 rounded-full transition-all relative z-10 ${isPlayingPreview ? 'text-rose-400 bg-rose-500/10' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}>
                                                            {isPlayingPreview ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Style Preset */}
                        {availableStyles.length > 0 && (
                            <div className="pt-6 border-t border-white/5 space-y-4 shrink-0 z-10">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Style Preset</p>
                                <div className="relative">
                                    <select value={style} onChange={(e) => setStyle(e.target.value)}
                                        className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors">
                                        <option value="">— Default Neural —</option>
                                        {availableStyles.map(s => <option key={s} value={s}>{STYLE_LABELS[s] ?? s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
