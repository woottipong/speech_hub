import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function AnimatedProcessing({ step }) {
    // step is 'queued' | 'converting' | 'transcribing' | 'done'

    return (
        <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait">
                {step === 'queued' && (
                    <Motion.svg key="queued" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Motion.circle cx="50" cy="50" r="35" stroke="#a855f7" strokeWidth="3" strokeDasharray="8 8" fill="transparent" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }} />
                        <Motion.circle cx="50" cy="50" r="22" fill="#a855f7" opacity="0.15" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                        <Motion.rect x="47" y="30" width="6" height="20" rx="3" fill="#d8b4fe" />
                        <Motion.rect x="47" y="50" width="6" height="15" rx="3" fill="#d8b4fe" style={{ transformOrigin: '50px 50px' }} animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    </Motion.svg>
                )}

                {step === 'converting' && (
                    <Motion.svg key="converting" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Motion.path d="M 20 50 Q 35 20 50 50 T 80 50" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" fill="transparent"
                            animate={{ d: ["M 20 50 Q 35 20 50 50 T 80 50", "M 20 50 Q 35 80 50 50 T 80 50", "M 20 50 Q 35 20 50 50 T 80 50"] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                        <Motion.path d="M 20 50 Q 35 80 50 50 T 80 50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" fill="transparent"
                            animate={{ d: ["M 20 50 Q 35 80 50 50 T 80 50", "M 20 50 Q 35 20 50 50 T 80 50", "M 20 50 Q 35 80 50 50 T 80 50"] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                        <Motion.circle cx="50" cy="50" r="6" fill="#fde68a" animate={{ r: [6, 12, 6], opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    </Motion.svg>
                )}

                {step === 'transcribing' && (
                    <Motion.svg key="transcribing" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <defs>
                            <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                        {/* Outer rotating nodes */}
                        <Motion.g animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }}>
                            <circle cx="50" cy="12" r="4" fill="#a5f3fc" />
                            <circle cx="88" cy="50" r="4" fill="#a5f3fc" />
                            <circle cx="50" cy="88" r="4" fill="#a5f3fc" />
                            <circle cx="12" cy="50" r="4" fill="#a5f3fc" />
                            <circle cx="50" cy="50" r="38" stroke="url(#aiGrad)" strokeWidth="1.5" strokeDasharray="4 8" fill="transparent" />
                        </Motion.g>
                        {/* Brain / Core Hexagon */}
                        <Motion.path d="M 50 25 L 72 37 L 72 63 L 50 75 L 28 63 L 28 37 Z" stroke="url(#aiGrad)" strokeWidth="2" fill="rgba(34,211,238,0.15)"
                            animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '50px 50px' }} />
                        <Motion.circle cx="50" cy="50" r="4" fill="#fff" animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        <Motion.path d="M 50 25 L 50 75 M 28 37 L 72 63 M 28 63 L 72 37" stroke="#67e8f9" strokeWidth="1" strokeDasharray="2 3"
                            animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    </Motion.svg>
                )}

                {step === 'done' && (
                    <Motion.svg key="done" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Motion.circle cx="50" cy="50" r="40" stroke="#34d399" strokeWidth="4" fill="transparent" animate={{ strokeDashoffset: [250, 0] }} strokeDasharray="250" transition={{ duration: 1, ease: "easeOut" }} />
                        <Motion.path d="M 30 50 L 45 65 L 70 35" stroke="#a7f3d0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="transparent" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} />
                        <Motion.circle cx="50" cy="50" r="40" fill="#34d399" opacity="0" animate={{ scale: [1, 1.3, 1], opacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} style={{ transformOrigin: '50px 50px' }} />
                    </Motion.svg>
                )}
            </AnimatePresence>
        </div>
    );
}
