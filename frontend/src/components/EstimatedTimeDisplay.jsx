import React, { useState, useEffect } from 'react';

export default function EstimatedTimeDisplay({ isLoading, charCount, provider = 'azure' }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (isLoading) {
            // Calculate initial time: ความยาวเสียง (วินาที) ≈ จำนวนตัวอักษร / 15
            let estSeconds = 0;
            if (charCount > 0) {
                estSeconds = Math.ceil(charCount / 15);
            }

            setTimeLeft(estSeconds);

            const interval = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setTimeLeft(0);
        }
    }, [isLoading, charCount, provider]);

    if (!isLoading) return null;

    const formatTime = (seconds) => {
        if (seconds === 0) return 'Almost done...';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s left`;
        return `${mins}m ${secs}s left`;
    };

    const calculateCost = (chars) => {
        return (chars * 0.0006).toFixed(4);
    };

    return (
        <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] text-white/50 font-mono">
                Processing: {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] text-white/30 font-mono">
                Est. Cost: ${calculateCost(charCount)}
            </span>
        </div>
    );
}
