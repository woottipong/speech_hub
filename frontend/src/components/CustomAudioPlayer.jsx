import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function CustomAudioPlayer({ src, colorClass = 'text-cyan-400', bgClass = 'bg-cyan-500', isGemini = false }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [activeBarIndex, setActiveBarIndex] = useState(-1);

    // Generate realistic waveform data using multiple harmonics
    const waveformData = useMemo(() => {
        const bars = 48;
        const data = [];
        // Use multiple sine waves to create more natural looking waveform
        for (let i = 0; i < bars; i++) {
            const position = i / bars;
            // Primary wave - main pattern
            const wave1 = Math.sin(position * Math.PI * 4) * 0.4;
            // Secondary wave - adds variation
            const wave2 = Math.sin(position * Math.PI * 7 + 1.5) * 0.25;
            // Tertiary wave - subtle detail
            const wave3 = Math.sin(position * Math.PI * 11 + 0.8) * 0.15;
            // Add some per-bar noise for realism
            const noise = (Math.sin(i * 0.7) * 0.5 + 0.5) * 0.2;

            // Combine and normalize to 0-1 range
            let height = Math.abs(wave1 + wave2 + wave3 + noise);
            // Scale to reasonable visual range (20% to 90%)
            height = 0.2 + height * 0.7;
            data.push(height);
        }
        return data;
    }, []);

    // Animate waveform during playback
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                // Create a moving wave effect
                setActiveBarIndex(Math.floor(Math.random() * waveformData.length));
            }, 80);
        } else {
            setActiveBarIndex(-1);
        }
        return () => clearInterval(interval);
    }, [isPlaying, waveformData]);

    // Reset state when src changes
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        setActiveBarIndex(-1);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            // Auto-play new audio if it's not the initial empty load
            if (src) {
                audioRef.current.play().catch(e => console.log('Auto-play prevented', e));
                setIsPlaying(true);
            }
        }
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        if (!isNaN(total)) {
            setProgress((current / total) * 100);
            setDuration(total);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleSeek = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newTime = (percentage / 100) * duration;

        audioRef.current.currentTime = newTime;
        setProgress(percentage);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine specific visual accents based on the provider
    const accentColor = isGemini ? 'amber' : 'cyan';
    const accentBgColorClass = isGemini ? 'bg-amber-400' : 'bg-cyan-400';
    const accentTextColorClass = isGemini ? 'text-amber-400' : 'text-cyan-400';

    return (
        <div className="flex flex-col w-full gap-2">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
                className="hidden"
            />

            <div className="flex items-center gap-3">
                <button
                    onClick={togglePlay}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${isPlaying
                            ? `bg-${accentColor}-500/20 border border-${accentColor}-500/40 ${accentTextColorClass}`
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                {/* Waveform / Progress bar */}
                <div
                    className="flex-1 h-10 bg-black/40 rounded-lg border border-white/5 relative overflow-hidden cursor-pointer"
                    onClick={handleSeek}
                >
                    {/* Waveform bars container */}
                    <div className="absolute inset-0 flex items-center justify-between px-1.5 py-2 gap-0.5">
                        {waveformData.map((height, i) => {
                            const isPlayed = (i / waveformData.length) * 100 <= progress;
                            const isActive = isPlaying && Math.abs(i - activeBarIndex) <= 2;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-150 ease-out ${isPlayed
                                            ? `${accentBgColorClass}`
                                            : 'bg-white/20'
                                        }`}
                                    style={{
                                        height: `${height * 100}%`,
                                        opacity: isActive && !isPlayed ? 0.6 : (isPlayed ? 0.9 : 0.3),
                                        transform: isActive ? 'scaleY(1.1)' : 'scaleY(1)',
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono text-white/40">{formatTime((progress / 100) * duration)}</span>
                <span className="text-[9px] font-mono text-white/40">{formatTime(duration)}</span>
            </div>
        </div>
    );
}
