import { DownloadCloud, FileText } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

function parseVttMeta(vtt) {
    const cues = vtt.match(/^\d{2}:\d{2}:\d{2}\.\d{3} --> (\d{2}:\d{2}:\d{2}\.\d{3})/gm) || [];
    const count = cues.length;
    if (count === 0) return { count: 0, duration: null };
    const lastEnd = cues[cues.length - 1].split(' --> ')[1];
    return { count, duration: lastEnd };
}

export default function VttResultCard({ vtt, filename = 'transcript' }) {
    const meta = parseVttMeta(vtt);

    const handleDownload = () => {
        const blob = new Blob([vtt], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.vtt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">Extracted Transcript</h3>
                        <p className="text-xs text-white/50 font-mono">
                            {meta.count > 0
                                ? `${meta.count} cues${meta.duration ? ` · ${meta.duration}` : ''}`
                                : 'Ready'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="glass-button flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all"
                >
                    <DownloadCloud className="w-4 h-4" /> Download .vtt
                </button>
            </div>

            <div className="relative group">
                <textarea
                    readOnly
                    value={vtt}
                    className="w-full rounded-xl bg-black/40 border border-white/5 text-sm font-mono p-5 h-[300px] resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white/80 leading-relaxed custom-scrollbar"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </Motion.div>
    );
}
