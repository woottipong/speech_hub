import React from 'react';
import { motion as Motion } from 'framer-motion';

export default function AnimatedCloud({ isDragging, className = "w-12 h-12" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cloudBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="#8a2be2" />
                </linearGradient>
                <linearGradient id="cloudArrow" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
            </defs>

            {/* Cloud Base/Back layer */}
            <Motion.path
                d="M 30 70 C 15 70 10 50 25 40 C 30 20 55 15 70 30 C 85 15 105 40 90 55 C 95 65 90 70 80 70 Z"
                fill="url(#cloudBody)"
                opacity="0.2"
                animate={{ y: isDragging ? -8 : 0, scale: isDragging ? 1.05 : 1 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
            />

            {/* Cloud Outline / Front Layer */}
            <Motion.path
                d="M 28 65 C 15 65 12 48 25 40 C 32 25 52 22 65 35 C 78 25 95 42 85 55 C 88 62 82 65 75 65 Z"
                stroke="url(#cloudBody)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(0,0,0,0.4)"
                animate={{ y: isDragging ? -5 : 0, scale: isDragging ? 1.05 : 1 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
            />

            {/* Upload Arrow */}
            <Motion.g
                animate={{ y: isDragging ? -15 : 0 }}
                transition={{
                    repeat: isDragging ? Infinity : 0,
                    repeatType: "reverse",
                    duration: 0.5,
                    ease: "easeInOut"
                }}
            >
                <path d="M 50 25 L 35 40 M 50 25 L 65 40" stroke="url(#cloudArrow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 50 25 L 50 55" stroke="url(#cloudArrow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </Motion.g>

            {/* Upload Base Line */}
            <Motion.path
                d="M 35 75 L 65 75"
                stroke="url(#cloudBody)"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ scaleX: isDragging ? 1.2 : 1, opacity: isDragging ? 0.3 : 1 }}
            />
        </svg>
    );
}
