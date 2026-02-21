import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function CustomAudioPlayer({ src, colorClass = 'text-cyan-400', bgClass = 'bg-cyan-500', isGemini = false }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    
    // Reset state when src changes
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
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
        <div className="flex flex-col w-full max-w-[280px] gap-2">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isPlaying 
                            ? `bg-${accentColor}-500/20 border border-${accentColor}-500/40 ${accentTextColorClass}` 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
                
                {/* Waveform / Progress bar */}
                <div 
                    className="flex-1 h-8 bg-black/40 rounded-lg border border-white/5 relative overflow-hidden cursor-pointer flex items-center"
                    onClick={handleSeek}
                >
                    {/* Simulated Waveform background */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-20">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="w-1 bg-white/50 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                        ))}
                    </div>
                    
                    {/* Active Progress fill */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 ${accentBgColorClass}/20 backdrop-blur-sm border-r border-${accentColor}-400/50 transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    >
                        {/* Simulated Waveform active */}
                        <div className="absolute inset-0 flex items-center justify-between px-2 w-[100vw] max-w-[210px]">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className={`w-1 ${accentBgColorClass} rounded-full opacity-80`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleMute}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
            </div>
            
            <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono text-white/40">{formatTime((progress / 100) * duration)}</span>
                <span className="text-[9px] font-mono text-white/40">{formatTime(duration)}</span>
            </div>
        </div>
    );
}
