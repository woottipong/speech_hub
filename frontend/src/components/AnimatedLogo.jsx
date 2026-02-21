import React from 'react';
import { motion as Motion } from 'framer-motion';

export default function AnimatedLogo({ className = "w-6 h-6" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#8a2be2" />
                    <stop offset="100%" stopColor="#ff0055" />
                </linearGradient>
            </defs>

            {/* Core Node */}
            <Motion.circle
                cx="50" cy="50" r="14" fill="url(#logoGrad)"
                animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Orbiting Track 1 */}
            <Motion.path
                d="M 15 50 C 15 30 70 30 85 50 C 100 70 30 70 15 50 Z"
                stroke="url(#logoGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ originX: "50px", originY: "50px" }}
                strokeDasharray="40 120"
            />

            {/* Orbiting Track 2 */}
            <Motion.path
                d="M 50 15 C 70 15 70 85 50 85 C 30 85 30 15 50 15 Z"
                stroke="url(#logoGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ originX: "50px", originY: "50px" }}
                strokeDasharray="40 120"
            />
        </svg>
    );
}
