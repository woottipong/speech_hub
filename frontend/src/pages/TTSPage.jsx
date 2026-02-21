import { useState, useRef } from 'react';
import { Play, Square, Loader2, MessageSquare, Volume2, Sparkles, AlertCircle, ChevronDown, Wand2, Users, Clock, Search, Check } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { API_BASE, TTS_VOICE_GROUPS, ALL_TTS_VOICES, GEMINI_TTS_VOICE_GROUPS, ALL_GEMINI_TTS_VOICES, STYLE_LABELS, TTS_MAX_CHARS } from '../lib/constants';
import { useTTS } from '../lib/TTSContext';

const GENDER_ICON = { Female: '♀', Male: '♂' };
const INSTRUCTION_MAX_CHARS = 300;

const getEstimateTime = (charCount, provider) => {
    if (charCount === 0) return '0s';
    const charsPerSec = provider === 'gemini' ? 15 : 20;
    const baseLatency = provider === 'gemini' ? 1.5 : 0.5;
    const estSeconds = Math.ceil((charCount / charsPerSec) + baseLatency);

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

export default function TTSPage() {
    const {
        provider,
        voice, setVoice,
        geminiVoice, setGeminiVoice,
        style, setStyle,
        isDialogueMode, setIsDialogueMode,
        speaker1Name, setSpeaker1Name,
        speaker1Voice, setSpeaker1Voice,
        speaker2Name, setSpeaker2Name,
        speaker2Voice, setSpeaker2Voice
    } = useTTS();

    const [text, setText] = useState('');
    const [instruction, setInstruction] = useState('');
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

    const isGemini = provider === 'gemini';
    const activeVoice = isGemini ? geminiVoice : voice;
    const rawVoiceGroups = isGemini ? GEMINI_TTS_VOICE_GROUPS : TTS_VOICE_GROUPS;

    // Advanced Filtering Logic
    const filteredVoiceGroups = rawVoiceGroups.map(group => ({
        ...group,
        voices: group.voices.filter(v => {
            const matchesSearch = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
            return matchesSearch && matchesGender;
        })
    })).filter(group => group.voices.length > 0);

    const selectedVoiceMeta = isGemini
        ? ALL_GEMINI_TTS_VOICES.find((v) => v.value === geminiVoice)
        : ALL_TTS_VOICES.find((v) => v.value === voice);
    const availableStyles = (!isGemini && selectedVoiceMeta?.styles) ? selectedVoiceMeta.styles : [];

    const handlePreview = async (e, v) => {
        e.stopPropagation();
        if (isGemini) return;
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
        if (isGemini) {
            setGeminiVoice(newVoice);
        } else {
            setVoice(newVoice);
            const meta = ALL_TTS_VOICES.find((v) => v.value === newVoice);
            if (!meta?.styles.includes(style)) setStyle('');
        }
    };

    const buildSpeakText = () => {
        const finalText = text.trim();
        if (!isGemini) return finalText;

        if (isDialogueMode) {
            const s1 = speaker1Name.trim() || 'Speaker 1';
            const s2 = speaker2Name.trim() || 'Speaker 2';
            let prompt = `TTS the following conversation between ${s1} and ${s2}:\n${finalText}`;
            if (instruction.trim()) {
                prompt = `Instruction: ${instruction.trim()}\n\n${prompt}`;
            }
            return prompt;
        } else {
            if (instruction.trim()) {
                return `${instruction.trim()}: ${finalText}`;
            }
            return finalText;
        }
    };

    const handleSpeak = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setErrorMsg('');

        try {
            const body = {
                text: buildSpeakText(),
                voice: activeVoice,
                style: isGemini ? '' : style,
                provider
            };

            if (isGemini && isDialogueMode) {
                const s1 = speaker1Name.trim() || 'Speaker 1';
                const s2 = speaker2Name.trim() || 'Speaker 2';
                body.multiSpeakerConfig = [
                    { speaker: s1, voiceName: speaker1Voice },
                    { speaker: s2, voiceName: speaker2Voice }
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

    const audioTitle = (isGemini && isDialogueMode)
        ? `Dialogue: ${speaker1Name || 'Speaker 1'} & ${speaker2Name || 'Speaker 2'}`
        : (selectedVoiceMeta?.label ?? 'Generated Stream');

    return (
        <div className="w-full space-y-4 pb-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-2 px-2">
                <div>
                    <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Vocal Synthesis
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="premium-badge badge-lobe hidden sm:inline-flex text-[10px] py-0.5">React Studio</span>
                    <span className="premium-badge badge-azure text-[10px] py-0.5">{isGemini ? 'Gemini 2.5 Flash' : 'Azure Neural'}</span>
                </div>
            </div>

            {/* Mode Toggle (Gemini Only) */}
            {isGemini && (
                <div className="flex p-1 bg-[#0a0d14] border border-white/5 rounded-xl w-fit">
                    <button
                        onClick={() => setIsDialogueMode(false)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isDialogueMode
                            ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'text-white/40 hover:text-white/80'
                            }`}
                    >
                        <Volume2 className="w-4 h-4" /> Single Voice
                    </button>
                    <button
                        onClick={() => setIsDialogueMode(true)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isDialogueMode
                            ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'text-white/40 hover:text-white/80'
                            }`}
                    >
                        <Users className="w-4 h-4" /> Dialogue Mode
                    </button>
                </div>
            )}

            <div className="glass-panel p-4 md:p-5 lg:p-6 space-y-6 relative overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
                    <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-hidden">
                        {/* ── Voice Selection ── */}
                        <div className="space-y-3">
                            {isDialogueMode ? (
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                        <Users className="w-3 h-3" /> Select Speakers
                                    </label>

                                    {/* Speaker 1 */}
                                    <div className="p-4 rounded-xl border border-white/10 bg-[#0a0d14]/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-blue-400">Speaker 1</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={speaker1Name}
                                                onChange={(e) => setSpeaker1Name(e.target.value)}
                                                placeholder="ชื่อตัวละคร (เช่น สมชาย)"
                                                className="w-1/3 rounded-lg bg-[#0a0d14] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                                            />
                                            <select
                                                value={speaker1Voice}
                                                onChange={(e) => setSpeaker1Voice(e.target.value)}
                                                className="w-2/3 rounded-lg bg-[#0a0d14] border border-white/10 text-white/90 text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                            >
                                                {ALL_GEMINI_TTS_VOICES.map(v => (
                                                    <option key={`s1-${v.value}`} value={v.value} className="bg-[#0d0d14]">
                                                        {v.label} ({v.gender === 'Female' ? '♀' : '♂'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Speaker 2 */}
                                    <div className="p-4 rounded-xl border border-white/10 bg-[#0a0d14]/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-pink-400">Speaker 2</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={speaker2Name}
                                                onChange={(e) => setSpeaker2Name(e.target.value)}
                                                placeholder="ชื่อตัวละคร (เช่น มานี)"
                                                className="w-1/3 rounded-lg bg-[#0a0d14] border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-pink-500/50"
                                            />
                                            <select
                                                value={speaker2Voice}
                                                onChange={(e) => setSpeaker2Voice(e.target.value)}
                                                className="w-2/3 rounded-lg bg-[#0a0d14] border border-white/10 text-white/90 text-sm px-3 py-2 focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                            >
                                                {ALL_GEMINI_TTS_VOICES.map(v => (
                                                    <option key={`s2-${v.value}`} value={v.value} className="bg-[#0d0d14]">
                                                        {v.label} ({v.gender === 'Female' ? '♀' : '♂'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-amber-400/60 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        💡 เคล็ดลับ: พิมพ์บทสนทนาโดยใช้ชื่อตัวละครนำหน้า เช่น<br />
                                        <span className="font-mono text-amber-300">
                                            {speaker1Name || 'สมชาย'}: สวัสดีครับ<br />
                                            {speaker2Name || 'มานี'}: สวัสดีค่ะ
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                            <span className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> Select Voice</span>
                                            {isGemini && <span className="text-[9px] font-normal text-amber-400/60 normal-case tracking-normal">Preview not available</span>}
                                        </label>

                                        {/* Search & Filter Bar */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Find voice by name..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-[#0a0d14] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="flex gap-1 p-1 bg-[#0a0d14] border border-white/10 rounded-lg shrink-0">
                                                {['All', 'Male', 'Female'].map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => setGenderFilter(g)}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${genderFilter === g
                                                            ? 'bg-purple-500/20 text-purple-300'
                                                            : 'text-white/40 hover:text-white/70'
                                                            }`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-white/5 bg-[#0a0d14] shadow-inner p-2 space-y-4">
                                            {filteredVoiceGroups.length > 0 ? filteredVoiceGroups.map((group) => (
                                                <div key={group.group} className="relative">
                                                    <div className="sticky top-0 z-20 bg-[#0a0d14] pt-2 pb-1 mb-2 border-b border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[9px] font-black text-cyan-400/80 uppercase tracking-[0.2em]">{group.group}</p>
                                                            <div className="h-[1px] flex-1 bg-white/5"></div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-4">
                                                        {group.voices.map((v) => {
                                                            const isActive = activeVoice === v.value;
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
                                                                    transition-all duration-200 cursor-pointer select-none relative
                                                                    ${isActive
                                                                            ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_2px_10px_rgba(168,85,247,0.1)]'
                                                                            : 'bg-[#151a26]/50 border-transparent hover:border-white/10 hover:bg-[#1d2433]'}
                                                                `}
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                                                                        {/* Avatar / Icon */}
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-purple-500/20 border-purple-400' : 'bg-[#0a0d14] border-white/5 group-hover:border-white/20'}`}>
                                                                            {isPlayingPreview ? (
                                                                                <div className="flex items-end gap-[1.5px] w-3 h-3 justify-center">
                                                                                    <Motion.div className="w-[2px] bg-purple-400 rounded-full" animate={{ height: ["20%", "100%", "30%", "80%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
                                                                                    <Motion.div className="w-[2px] bg-purple-400 rounded-full" animate={{ height: ["60%", "20%", "90%", "40%", "70%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0.1 }} />
                                                                                    <Motion.div className="w-[2px] bg-purple-400 rounded-full" animate={{ height: ["40%", "80%", "20%", "100%", "50%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0.2 }} />
                                                                                </div>
                                                                            ) : (
                                                                                <span className={`text-[12px] ${v.gender === 'Female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                                                                    {v.gender === 'Female' ? '♀' : '♂'}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-white/70'}`}>{v.label}</p>
                                                                                {isActive && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                                                                            </div>
                                                                            <p className="text-[10px] text-white/20 font-medium truncate">{v.desc}</p>
                                                                        </div>
                                                                    </div>

                                                                    {!isGemini && (
                                                                        <button
                                                                            onClick={(e) => handlePreview(e, v)}
                                                                            className={`
                                                                                p-2 rounded-full transition-all relative z-10
                                                                                ${isPlayingPreview
                                                                                    ? 'text-rose-400 bg-rose-500/10'
                                                                                    : 'text-white/20 hover:text-white/60 hover:bg-white/5'}
                                                                            `}
                                                                        >
                                                                            {isPlayingPreview ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
                                                    <Search className="w-8 h-8 mb-2" />
                                                    <p className="text-xs font-medium">No voices found matching your search</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div> {/* <-- Close Left Column */}

                    {/* ── Right Column: Text Input + Style + Actions ── */}
                    <div className="lg:col-span-8 flex flex-col space-y-4 h-full min-h-0">
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

                        {/* ── Gemini Instruction Field ── */}
                        <AnimatePresence>
                            {isGemini && (
                                <Motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                            <Wand2 className="w-3 h-3 text-amber-400" /> Tone Instruction
                                        </span>
                                        <span className={`text-[10px] font-mono ${instruction.length > INSTRUCTION_MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-white/30'}`}>
                                            {instruction.length} / {INSTRUCTION_MAX_CHARS}
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={instruction}
                                        onChange={(e) => setInstruction(e.target.value.slice(0, INSTRUCTION_MAX_CHARS))}
                                        placeholder="เช่น พูดด้วยน้ำเสียงสดใสและเป็นมิตร, Read in a calm and soothing tone..."
                                        className="w-full rounded-xl bg-[#0a0d14] border border-amber-500/20 text-white/80 text-sm px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/15"
                                    />
                                    <p className="text-[10px] text-amber-400/50 px-1">
                                        Instruction จะถูกนำหน้าข้อความก่อนส่งไป Gemini เช่น <span className="font-mono text-amber-300/60">&quot;{instruction || 'พูดด้วยน้ำเสียงสดใส'}: [ข้อความ]&quot;</span>
                                    </p>
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-[0.2em]">
                                <MessageSquare className="w-3 h-3" /> Input Script
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                                    <Clock className="w-3 h-3" />
                                    Est. Time: {getEstimateTime(text.length, provider)}
                                </span>
                                <span className={`text-[10px] font-mono ${text.length > TTS_MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-white/30'}`}>
                                    {text.length} / {TTS_MAX_CHARS}
                                </span>
                            </div>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, TTS_MAX_CHARS))}
                            placeholder="พิมพ์หรือวางข้อความภาษาไทยที่นี่..."
                            className="w-full flex-1 min-h-[150px] rounded-xl bg-[#0a0d14] border border-white/5 text-sm p-4 resize-none transition-all placeholder:text-white/10 text-white/90 focus:outline-none focus:border-purple-500/50 custom-scrollbar leading-relaxed shadow-inner"
                        />

                        <div className="flex flex-col gap-3 mt-auto pt-2">
                            {/* Voice info pill & Error message */}
                            <div className="flex items-center justify-between min-h-[24px]">
                                {isDialogueMode ? (
                                    <div className="flex items-center gap-2 text-[10px] font-mono px-1">
                                        <span className="text-blue-400/60">S1: {speaker1Voice}</span>
                                        <span className="text-white/20">|</span>
                                        <span className="text-pink-400/60">S2: {speaker2Voice}</span>
                                    </div>
                                ) : selectedVoiceMeta ? (
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
                                className="w-full primary-button flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing Audio...</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Synthesize & Play</>
                                )}
                            </button>

                            {/* Audio Result — integrated inside the right column flow */}
                            <AnimatePresence>
                                {audioUrl && (
                                    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                            <Volume2 className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-white text-[11px] truncate">{audioTitle}</h4>
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono truncate">
                                                {isGemini ? 'Gemini TTS' : (style ? `Style: ${style}` : 'Default')}
                                            </p>
                                        </div>
                                        <audio ref={audioRef} src={audioUrl} controls className="h-8 max-w-[180px] outline-none opacity-80" />
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
