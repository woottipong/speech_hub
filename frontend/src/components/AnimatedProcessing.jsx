import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function AnimatedProcessing({ step }) {
    // step is 'queued' | 'converting' | 'transcribing' | 'done'

    return (
        <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait">
                {step === 'queued' && (
                    <Motion.svg key="queued" viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
                        {/* Outer ring */}
                        <Motion.circle cx="50" cy="50" r="40" stroke="#a855f7" strokeWidth="2" strokeDasharray="12 8" fill="transparent"
                            animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }} />
                        {/* Middle ring - counter rotate */}
                        <Motion.circle cx="50" cy="50" r="28" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="6 10" fill="transparent"
                            animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }} />
                        {/* Center pulsing */}
                        <Motion.circle cx="50" cy="50" r="8" fill="#a855f7"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        {/* Corner dots */}
                        <Motion.circle cx="50" cy="10" r="3" fill="#e9d5ff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                        <Motion.circle cx="90" cy="50" r="3" fill="#e9d5ff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.25 }} />
                        <Motion.circle cx="50" cy="90" r="3" fill="#e9d5ff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />
                        <Motion.circle cx="10" cy="50" r="3" fill="#e9d5ff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.75 }} />
                    </Motion.svg>
                )}

                {step === 'converting' && (
                    <Motion.svg key="converting" viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_20px_rgba(251,191,0.6)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
                        <defs>
                            <linearGradient id="convertGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                        {/* Animated wave lines */}
                        <Motion.path d="M 15 50 Q 30 25 50 50 T 85 50" stroke="url(#convertGrad)" strokeWidth="4" strokeLinecap="round" fill="transparent"
                            animate={{ d: ["M 15 50 Q 30 25 50 50 T 85 50", "M 15 50 Q 30 75 50 50 T 85 50", "M 15 50 Q 30 25 50 50 T 85 50"] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
                        <Motion.path d="M 15 50 Q 30 35 50 50 T 85 50" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" fill="transparent" opacity="0.6"
                            animate={{ d: ["M 15 50 Q 30 35 50 50 T 85 50", "M 15 50 Q 30 65 50 50 T 85 50", "M 15 50 Q 30 35 50 50 T 85 50"] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
                        {/* Center glow */}
                        <Motion.circle cx="50" cy="50" r="8" fill="#fef3c7"
                            animate={{ r: [8, 14, 8], opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                        {/* Progress dots */}
                        {[0, 1, 2].map((i) => (
                            <Motion.circle key={i} cx={30 + i * 20} cy="80" r="3" fill="#fbbf24"
                                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </Motion.svg>
                )}

                {step === 'transcribing' && (
                    <Motion.svg key="transcribing" viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
                        <defs>
                            <linearGradient id="aiGrad2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                            <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#67e8f9" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                        {/* Outer rotating ring */}
                        <Motion.circle cx="50" cy="50" r="42" stroke="url(#aiGrad2)" strokeWidth="1.5" strokeDasharray="8 12" fill="transparent"
                            animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }} />
                        {/* Orbiting nodes */}
                        <Motion.g animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }}>
                            <circle cx="50" cy="10" r="4" fill="#22d3ee">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="90" cy="50" r="4" fill="#818cf8">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="50" cy="90" r="4" fill="#22d3ee">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="10" cy="50" r="4" fill="#818cf8">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                        </Motion.g>
                        {/* Central hexagon */}
                        <Motion.path d="M 50 22 L 74 36 L 74 64 L 50 78 L 26 64 L 26 36 Z" stroke="url(#coreGrad)" strokeWidth="2.5" fill="rgba(34,211,238,0.15)"
                            animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '50px 50px' }} />
                        {/* Center pulse */}
                        <Motion.circle cx="50" cy="50" r="6" fill="#fff"
                            animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        {/* Cross lines */}
                        <Motion.path d="M 50 28 L 50 72 M 32 42 L 68 58 M 32 58 L 68 42" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3 4"
                            animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
                    </Motion.svg>
                )}

                {step === 'synthesizing' && (
                    <Motion.svg key="synthesizing" viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
                        <defs>
                            <linearGradient id="waveGrad2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f472b6" />
                                <stop offset="50%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#db2777" />
                            </linearGradient>
                        </defs>
                        {/* Outer glow ring */}
                        <Motion.circle cx="50" cy="50" r="44" stroke="rgba(236,72,153,0.15)" strokeWidth="2" fill="transparent" />
                        {/* Rotating arc */}
                        <Motion.circle cx="50" cy="50" r="44" stroke="#f472b6" strokeWidth="2" strokeDasharray="80 200" fill="transparent"
                            animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50px 50px' }} />
                        {/* Audio wave bars - enhanced */}
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Motion.rect key={i} x={24 + i * 11} y="30" width="7" rx="3.5" fill="url(#waveGrad2)"
                                animate={{
                                    height: [20 + i * 3, 50 + i * 2, 20 + i * 3],
                                    y: [40 - i * 1.5, 25 - i, 40 - i * 1.5],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                            />
                        ))}
                        {/* Center dot */}
                        <Motion.circle cx="50" cy="50" r="5" fill="#fce7f3"
                            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                    </Motion.svg>
                )}

                {step === 'done' && (
                    <Motion.svg key="done" viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
                        {/* Background circle */}
                        <Motion.circle cx="50" cy="50" r="40" fill="rgba(52,211,153,0.1)"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                        {/* Progress ring */}
                        <Motion.circle cx="50" cy="50" r="38" stroke="#34d399" strokeWidth="4" fill="transparent"
                            animate={{ strokeDashoffset: [240, 0] }} strokeDasharray="240" transition={{ duration: 0.8, ease: "easeOut" }} />
                        {/* Checkmark */}
                        <Motion.path d="M 30 50 L 45 65 L 70 35" stroke="#a7f3d0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }} />
                        {/* Sparkles */}
                        <Motion.circle cx="25" cy="25" r="2" fill="#6ee7b7" animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                        <Motion.circle cx="75" cy="25" r="1.5" fill="#6ee7b7" animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
                        <Motion.circle cx="75" cy="75" r="2" fill="#6ee7b7" animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.1 }} />
                        <Motion.circle cx="25" cy="75" r="1.5" fill="#6ee7b7" animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
                    </Motion.svg>
                )}
            </AnimatePresence>
        </div>
    );
}
