import React from 'react';
import { motion as Motion } from 'framer-motion';

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg-deep)]">
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.15)" />
                    </pattern>
                    <radialGradient id="meshGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25" />
                        <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="meshGrad2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ff0055" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#dotGrid)" />

                {/* Left Side Glow */}
                <Motion.circle
                    cx="-10%" cy="40%" r="600"
                    fill="url(#meshGrad)"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.7, 0.4],
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Right Side Glow */}
                <Motion.circle
                    cx="110%" cy="60%" r="700"
                    fill="url(#meshGrad2)"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, -80, 0],
                        y: [0, 80, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </svg>

            {/* Animated Sound Waves at the Bottom */}
            <svg
                className="absolute w-full h-[60vh] bottom-0 left-0 opacity-10 mix-blend-screen"
                viewBox="0 0 1440 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ff0055" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff0055" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.5" />
                    </linearGradient>
                    <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="20" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <g filter="url(#waveGlow)">
                    <Motion.path
                        initial={{ d: "M 0,200 C 240,100 480,300 720,200 C 960,100 1200,300 1440,200 L 1440,400 L 0,400 Z" }}
                        animate={{ d: "M 0,200 C 300,300 400,50 720,200 C 1040,350 1100,50 1440,200 L 1440,400 L 0,400 Z" }}
                        transition={{ repeat: Infinity, repeatType: "mirror", duration: 18, ease: "easeInOut" }}
                        fill="url(#wave1)"
                    />
                    <Motion.path
                        initial={{ d: "M 0,250 C 240,350 480,150 720,250 C 960,350 1200,150 1440,250 L 1440,400 L 0,400 Z" }}
                        animate={{ d: "M 0,250 C 300,100 400,400 720,250 C 1040,100 1100,400 1440,250 L 1440,400 L 0,400 Z" }}
                        transition={{ repeat: Infinity, repeatType: "mirror", duration: 14, ease: "easeInOut", delay: 1 }}
                        fill="url(#wave2)"
                        opacity="0.9"
                    />
                </g>
            </svg>
        </div>
    );
}
