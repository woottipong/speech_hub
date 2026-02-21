export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const Phase = Object.freeze({
    IDLE: 'idle',
    UPLOADING: 'uploading',
    PROCESSING: 'processing',
    DONE: 'done',
    ERROR: 'error',
});

export const SUPPORTED_LANGUAGES = [
    { value: 'th-TH', label: 'ไทย (Thai)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'ja-JP', label: '日本語 (Japanese)' },
    { value: 'zh-CN', label: '中文 (Chinese Simplified)' },
    { value: 'ko-KR', label: '한국어 (Korean)' },
];

export const STT_PROVIDERS = [
    {
        value: 'azure',
        label: 'Azure STT',
        subtitle: 'Microsoft Cognitive Services',
        tags: ['Real-time', 'Neural'],
        icon: '☁️',
        accentClass: 'text-blue-400',
        activeClass: 'border-blue-400/60 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        tagClass: 'bg-blue-500/15 text-blue-300/80',
        dotClass: 'bg-blue-400',
    },
    {
        value: 'google',
        label: 'Google STT',
        subtitle: 'Cloud Speech-to-Text v2',
        tags: ['Chirp 2', 'Batch'],
        icon: '🔍',
        accentClass: 'text-emerald-400',
        activeClass: 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        tagClass: 'bg-emerald-500/15 text-emerald-300/80',
        dotClass: 'bg-emerald-400',
    },
];

/**
 * Full TTS voice catalog grouped by category.
 * styles: [] means the voice has no style support (plain text synthesis only).
 * Multilingual voices speak Thai via the locale override in SSML.
 */
const PREVIEW_TH = 'สวัสดีครับ ยินดีต้อนรับสู่ Speech Hub';
const PREVIEW_TH_F = 'สวัสดีค่ะ ยินดีต้อนรับสู่ Speech Hub';

export const TTS_VOICE_GROUPS = [
    {
        group: '🇹🇭 Thai Native (th-TH)',
        voices: [
            {
                value: 'th-TH-PremwadeeNeural',
                label: 'Premwadee',
                gender: 'Female',
                desc: 'Natural & Smooth',
                styles: [],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'th-TH-NiwatNeural',
                label: 'Niwat',
                gender: 'Male',
                desc: 'Professional & Clear',
                styles: [],
                preview: PREVIEW_TH,
            },
            {
                value: 'th-TH-AcharaNeural',
                label: 'Achara',
                gender: 'Female',
                desc: 'Friendly & Warm',
                styles: [],
                preview: PREVIEW_TH_F,
            },
        ],
    },
    {
        group: '🌐 Multilingual — supports Thai',
        voices: [
            {
                value: 'en-US-AndrewMultilingualNeural',
                label: 'Andrew',
                gender: 'Male',
                desc: 'Natural, conversational',
                styles: ['empathetic', 'relieved'],
                preview: PREVIEW_TH,
            },
            {
                value: 'en-US-AvaMultilingualNeural',
                label: 'Ava',
                gender: 'Female',
                desc: 'Warm & expressive',
                styles: [],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-BrianMultilingualNeural',
                label: 'Brian',
                gender: 'Male',
                desc: 'Friendly & clear',
                styles: [],
                preview: PREVIEW_TH,
            },
            {
                value: 'en-US-EmmaMultilingualNeural',
                label: 'Emma',
                gender: 'Female',
                desc: 'Professional',
                styles: [],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-SerenaMultilingualNeural',
                label: 'Serena',
                gender: 'Female',
                desc: 'Versatile & expressive',
                styles: ['empathetic', 'excited', 'friendly', 'relieved', 'sad', 'serious', 'shy'],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-DerekMultilingualNeural',
                label: 'Derek',
                gender: 'Male',
                desc: 'Dynamic range',
                styles: ['empathetic', 'excited', 'relieved', 'shy'],
                preview: PREVIEW_TH,
            },
            {
                value: 'en-US-NancyMultilingualNeural',
                label: 'Nancy',
                gender: 'Female',
                desc: 'Lively & fun',
                styles: ['excited', 'friendly', 'funny', 'relieved', 'shy'],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-PhoebeMultilingualNeural',
                label: 'Phoebe',
                gender: 'Female',
                desc: 'Thoughtful & calm',
                styles: ['empathetic', 'sad', 'serious'],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-DavisMultilingualNeural',
                label: 'Davis',
                gender: 'Male',
                desc: 'Engaging & fun',
                styles: ['empathetic', 'funny', 'relieved'],
                preview: PREVIEW_TH,
            },
            {
                value: 'en-US-JennyMultilingualNeural',
                label: 'Jenny',
                gender: 'Female',
                desc: 'Friendly assistant',
                styles: [],
                preview: PREVIEW_TH_F,
            },
            {
                value: 'en-US-RyanMultilingualNeural',
                label: 'Ryan',
                gender: 'Male',
                desc: 'Casual & relaxed',
                styles: [],
                preview: PREVIEW_TH,
            },
        ],
    },
];

// Flat list for backward-compat lookups
export const ALL_TTS_VOICES = TTS_VOICE_GROUPS.flatMap((g) => g.voices);

export const STYLE_LABELS = {
    empathetic: '🤝 Empathetic',
    relieved: '😌 Relieved',
    excited: '🎉 Excited',
    friendly: '😊 Friendly',
    funny: '😄 Funny',
    shy: '🫣 Shy',
    sad: '😢 Sad',
    serious: '🧐 Serious',
};

export const TTS_MAX_CHARS = 3000;
