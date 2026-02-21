import { useState, useRef } from 'react';
import { Play, Loader2, MessageSquare, Volume2, Sparkles, AlertCircle, ChevronDown, Wand2, Users, Clock, Search, Check, Cloud } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { API_BASE, GEMINI_TTS_VOICE_GROUPS, ALL_GEMINI_TTS_VOICES, TTS_MAX_CHARS } from '../lib/constants';
import { useTTS } from '../lib/TTSContext';

const INSTRUCTION_MAX_CHARS = 300;

const getEstimateTime = (charCount) => {
    if (charCount === 0) return '0s';
    const estSeconds = Math.ceil((charCount / 15) + 1.5);
    if (estSeconds < 60) return `~${estSeconds}s`;
    const mins = Math.floor(estSeconds / 60);
    const secs = estSeconds % 60;
    return `~${mins}m ${secs}s`;
};

export default function GeminiTTSPage() {
    const {
        geminiVoice, setGeminiVoice,
        isDialogueMode, setIsDialogueMode,
        speaker1Name, setSpeaker1Name,
        speaker1Voice, setSpeaker1Voice,
        speaker2Name, setSpeaker2Name,
        speaker2Voice, setSpeaker2Voice,
    } = useTTS();

    const [text, setText] = useState('');
    const [instruction, setInstruction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const audioRef = useRef(null);
    const prevAudioUrlRef = useRef('');

    const filteredVoiceGroups = GEMINI_TTS_VOICE_GROUPS.map(group => ({
        ...group,
        voices: group.voices.filter(v => {
            const matchesSearch = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
            return matchesSearch && matchesGender;
        })
    })).filter(group => group.voices.length > 0);

    const selectedVoiceMeta = ALL_GEMINI_TTS_VOICES.find((v) => v.value === geminiVoice);

    const buildSpeakText = () => {
        const finalText = text.trim();
        if (isDialogueMode) {
            const s1 = speaker1Name.trim() || 'Speaker 1';
            const s2 = speaker2Name.trim() || 'Speaker 2';
            let prompt = `TTS the following conversation between ${s1} and ${s2}:\n${finalText}`;
            if (instruction.trim()) {
                prompt = `Instruction: ${instruction.trim()}\n\n${prompt}`;
            }
            return prompt;
        }
        if (instruction.trim()) {
            return `${instruction.trim()}: ${finalText}`;
        }
        return finalText;
    };

    const handleSpeak = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setErrorMsg('');
        try {
            const body = {
                text: buildSpeakText(),
                voice: geminiVoice,
                style: '',
                provider: 'gemini',
            };
            if (isDialogueMode) {
                const s1 = speaker1Name.trim() || 'Speaker 1';
                const s2 = speaker2Name.trim() || 'Speaker 2';
                body.multiSpeakerConfig = [
                    { speaker: s1, voiceName: speaker1Voice },
                    { speaker: s2, voiceName: speaker2Voice },
                ];
            }
            const res = await fetch(`${API_BASE}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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

    const audioTitle = isDialogueMode
        ? `Dialogue: ${speaker1Name || 'Speaker 1'} & ${speaker2Name || 'Speaker 2'}`
        : (selectedVoiceMeta?.label ?? 'Generated Stream');

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pt-1 pb-12 px-1">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Cloud className="w-6 h-6 text-amber-400" />
                        Gemini AI TTS
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1.5">
                        Google's advanced speech model with multi-speaker dialogue support.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-gemini text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]"><Cloud className="w-3 h-3" /> Google Engine</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">

                {/* ── Script Editor ── */}
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    <div className="glass-panel p-6 lg:p-8 flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0a0d14]/60 border-white/5 shadow-2xl">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
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
                            placeholder={isDialogueMode
                                ? `${speaker1Name || 'สมชาย'}: สวัสดีครับ วันนี้เป็นยังไงบ้าง\n${speaker2Name || 'มานี'}: สบายดีค่ะ แล้วคุณล่ะ?`
                                : 'Type or paste your content to synthesize...'}
                            className="flex-1 w-full bg-transparent border-none text-white/90 text-lg p-0 resize-none focus:outline-none custom-scrollbar leading-relaxed placeholder:text-white/10 z-10"
                            spellCheck="false"
                        />

                        {/* Dialogue line preview */}
                        {isDialogueMode && text.trim() && (
                            <div className="mt-8 pt-6 border-t border-white/5 space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar z-10">
                                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-4">Dialogue Preview</p>
                                {text.split('\n').filter(l => l.trim()).map((line, i) => {
                                    const isS1 = i % 2 === 0;
                                    return (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <span className={`font-black shrink-0 w-24 text-[9px] uppercase tracking-tighter text-right ${isS1 ? 'text-blue-400/40' : 'text-pink-400/40'}`}>
                                                {isS1 ? (speaker1Name || 'Speaker 1') : (speaker2Name || 'Speaker 2')}
                                            </span>
                                            <span className="text-white/20 group-hover:text-white/40 transition-colors text-xs line-clamp-1">{line}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                            style={!text.trim() || isLoading ? {} : { background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
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
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                                        <Volume2 className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-white text-sm truncate">{audioTitle}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">
                                            Gemini AI · 24KHz
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
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/5 blur-[90px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between gap-3 mb-6 shrink-0 z-10 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <Wand2 className="w-5 h-5 text-amber-400" />
                                <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Settings</span>
                            </div>
                            <div className="flex bg-black/40 rounded-lg border border-white/5 p-1">
                                <button onClick={() => setIsDialogueMode(false)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${!isDialogueMode ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                    Single
                                </button>
                                <button onClick={() => setIsDialogueMode(true)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${isDialogueMode ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                    <Users className="w-3 h-3" /> Dialogue
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4 space-y-6 z-10">
                            {isDialogueMode ? (
                                /* ── Dialogue: Speaker config ── */
                                <div className="space-y-6">
                                    {[
                                        { label: 'Speaker One', color: 'text-blue-400/50', borderActive: 'border-blue-500/20', name: speaker1Name, setName: setSpeaker1Name, voiceVal: speaker1Voice, setVoice: setSpeaker1Voice },
                                        { label: 'Speaker Two', color: 'text-pink-400/50', borderActive: 'border-pink-500/20', name: speaker2Name, setName: setSpeaker2Name, voiceVal: speaker2Voice, setVoice: setSpeaker2Voice },
                                    ].map((spk) => (
                                        <div key={spk.label} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${spk.color}`}>{spk.label}</span>
                                            </div>
                                            <div className={`p-4 rounded-xl bg-[#151a26]/50 border transition-all ${spk.borderActive} space-y-3`}>
                                                <input
                                                    type="text" value={spk.name} onChange={(e) => spk.setName(e.target.value)}
                                                    placeholder="Character name..."
                                                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
                                                />
                                                <div className="relative">
                                                    <select value={spk.voiceVal} onChange={(e) => spk.setVoice(e.target.value)}
                                                        className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/80 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors">
                                                        {ALL_GEMINI_TTS_VOICES.map(v => (
                                                            <option key={v.value} value={v.value}>{v.label} ({v.gender === 'Female' ? '♀' : '♂'})</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* ── Single: Voice list ── */
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                                        <input type="text" placeholder="Find voice..." value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                                        {['All', 'Male', 'Female'].map(g => (
                                            <button key={g} onClick={() => setGenderFilter(g)}
                                                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${genderFilter === g ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-6 pr-2">
                                        {filteredVoiceGroups.map(group => (
                                            <div key={group.group} className="space-y-3">
                                                <div className="flex items-center gap-2 sticky top-0 z-10 bg-[#0a0d14]/95 backdrop-blur-sm py-1">
                                                    <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">{group.group}</p>
                                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {group.voices.map(v => {
                                                        const isActive = geminiVoice === v.value;
                                                        return (
                                                            <div key={v.value} onClick={() => setGeminiVoice(v.value)}
                                                                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_2px_10px_rgba(245,158,11,0.15)]' : 'bg-[#151a26]/50 border-transparent hover:border-white/10 hover:bg-[#1d2433]'}`}>
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-amber-500/20 border-amber-400' : 'bg-[#0a0d14] border-white/5 group-hover:border-white/20'}`}>
                                                                        <span className={`text-[12px] ${v.gender === 'Female' ? 'text-pink-400' : 'text-blue-400'}`}>{v.gender === 'Female' ? '♀' : '♂'}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-white/70'}`}>{v.label}</p>
                                                                            {isActive && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                                                                        </div>
                                                                        <p className="text-[10px] text-white/30 font-medium truncate mt-0.5">{v.desc}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tone Instruction */}
                        <div className="pt-6 border-t border-white/5 space-y-4 shrink-0 z-10">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Tone Context</p>
                                <span className={`text-xs font-mono font-bold ${instruction.length > INSTRUCTION_MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-white/30'}`}>
                                    {instruction.length}/{INSTRUCTION_MAX_CHARS}
                                </span>
                            </div>
                            <textarea
                                value={instruction} onChange={(e) => setInstruction(e.target.value.slice(0, INSTRUCTION_MAX_CHARS))}
                                placeholder="e.g. Speak in a warm and friendly tone..."
                                className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 min-h-[80px] resize-none leading-relaxed transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
