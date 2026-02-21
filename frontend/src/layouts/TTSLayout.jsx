import { Outlet, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Bot, Cloud, Zap } from 'lucide-react';
import { TTSProvider, useTTS } from '../lib/TTSContext';

const TTS_PROVIDERS = [
    { value: 'azure', label: 'Azure Neural', icon: Bot, isAvailable: true, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', activeShadow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
    { value: 'gemini', label: 'Gemini TTS', icon: Cloud, isAvailable: true, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', activeShadow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' },
];

function EngineSelector() {
    const { provider, setProvider } = useTTS();

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 space-y-4">
            <div className="flex justify-center p-1.5 glass-panel rounded-2xl w-fit mx-auto border-white/10 bg-black/50 shadow-2xl">
                {TTS_PROVIDERS.map((p) => {
                    const isActive = provider === p.value;
                    const Icon = p.icon;
                    return (
                        <button
                            key={p.value}
                            onClick={() => p.isAvailable && setProvider(p.value)}
                            disabled={!p.isAvailable}
                            aria-label={`Select ${p.label} engine`}
                            className={`
                                relative px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 z-10
                                ${isActive ? `${p.bg} border ${p.border} ${p.activeShadow} text-white` : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'}
                                ${!p.isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {isActive && (
                                <Motion.div
                                    layoutId="tts-engine-highlight"
                                    className={`absolute inset-0 rounded-xl border ${p.border} opacity-60 pointer-events-none`}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon className={`w-4 h-4 relative z-10 ${isActive ? p.color : ''}`} />
                            <span className="font-semibold text-sm tracking-wide relative z-10">{p.label}</span>
                            {!p.isAvailable && (
                                <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded-full relative z-10">Soon</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-center">
                <span className="flex items-center gap-1.5 text-[10px] text-white/25 font-mono uppercase tracking-widest">
                    <Zap className="w-2.5 h-2.5 text-yellow-400/50" /> Synthesis Engine
                </span>
            </div>
        </div>
    );
}

function TTSLayoutInner() {
    const location = useLocation();

    return (
        <div className="w-full flex flex-col items-center">
            <EngineSelector />
            <div className="w-full max-w-5xl relative">
                <AnimatePresence mode="wait">
                    <Motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </Motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function TTSLayout() {
    return (
        <TTSProvider>
            <TTSLayoutInner />
        </TTSProvider>
    );
}
