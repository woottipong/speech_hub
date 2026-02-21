import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/constants';

export default function LanguageSelector({ value, onChange }) {
    return (
        <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-white/40 shrink-0" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-black/40 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer hover:border-white/20"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-[#0d0d14]">
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
