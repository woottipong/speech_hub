import { motion as Motion } from 'framer-motion';

export default function ProgressBar({ progress, label = 'Uploading...' }) {
    return (
        <div className="w-full relative glass-panel p-5 mt-4 overflow-hidden glow-border border-cyan-500/30">
            {/* Background animated gradient */}
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-pulse" />

            <div className="flex justify-between items-end mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">{label}</span>
                </div>
                <span className="text-xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden shadow-inner border border-white/5 relative z-10">
                <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #8a2be2, #00f0ff)', boxShadow: '0 0 20px rgba(0,240,255,0.8)' }}
                >
                    {/* Animated shimmer effect */}
                    <div className="absolute top-0 left-0 bottom-0 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" style={{ backgroundSize: '200% 100%' }} />
                    {/* Barber-pole stripes */}
                    <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[slide_1s_linear_infinite]" />
                </Motion.div>
            </div>
        </div>
    );
}
