import { useCallback, useState } from 'react';
import { FileAudio, FileVideo, AlertCircle } from 'lucide-react';
import AnimatedCloud from './AnimatedCloud';

const ACCEPTED_MIME = /^(audio|video)\//;
const MAX_SIZE_MB = 500;

export default function Dropzone({ onFileSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    const validate = useCallback((file) => {
        if (!ACCEPTED_MIME.test(file.type)) return 'Invalid file type. Please upload audio or video.';
        if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File exceeds maximum size of ${MAX_SIZE_MB} MB.`;
        return null;
    }, []);

    const handleFile = useCallback((file) => {
        const err = validate(file);
        if (err) { setError(err); setSelectedFile(null); return; }
        setError(''); setSelectedFile(file); onFileSelect(file);
    }, [validate, onFileSelect]);

    const onDrop = useCallback((e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const onInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const formatSize = (bytes) => (bytes < 1048576) ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`
                relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${selectedFile ? 'p-4' : 'p-6 text-center'}
                ${isDragging
                    ? 'border-[var(--accent-cyan)] bg-cyan-500/10 scale-[1.01]'
                    : 'border-white/20 hover:border-cyan-400/50 hover:bg-white/5'}
            `}
        >
            <input
                type="file"
                accept="audio/*,video/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={onInputChange}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[var(--accent-purple)]/15 blur-[40px] pointer-events-none rounded-full" />

            <div className="relative z-10">
                {!selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCloud isDragging={isDragging} className="w-14 h-14" />
                        <div>
                            <p className="text-sm font-bold text-white mb-0.5">Drag & drop or click to browse</p>
                            <p className="text-[var(--text-muted)] text-xs font-medium">
                                MP3, WAV, MP4, M4A, OGG, WebM · <span className="text-white/50">up to 500 MB</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Horizontal compact layout when file is selected */
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 shrink-0">
                            {selectedFile.type.startsWith('video')
                                ? <FileVideo className="w-5 h-5 text-cyan-400" />
                                : <FileAudio className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-white truncate">{selectedFile.name}</p>
                            <p className="text-xs font-mono text-cyan-200/60 mt-0.5">{formatSize(selectedFile.size)}</p>
                        </div>
                        <p className="text-[10px] text-white/30 shrink-0">Click to change</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
            )}
        </div>
    );
}
