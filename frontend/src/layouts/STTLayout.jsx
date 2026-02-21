import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { UploadCloud, Radio } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const sttTabs = [
    { to: '/stt/upload', label: 'File Upload', icon: UploadCloud, description: 'Convert audio/video files' },
    { to: '/stt/realtime', label: 'Realtime', icon: Radio, description: 'Live Azure STT stream' },
];

export default function STTLayout() {
    const location = useLocation();

    return (
        <div className="w-full flex flex-col items-center">
            {/* STT Header & Sub-navigation */}
            <div className="w-full max-w-2xl mx-auto mb-8 space-y-6">
                {/* Premium Sub-navigation Pills */}
                <div className="flex justify-center p-1.5 glass-panel rounded-2xl w-fit mx-auto border-white/10 bg-black/50 shadow-2xl">
                    {sttTabs.map((tab) => {
                        const isActive = location.pathname === tab.to;
                        const Icon = tab.icon;
                        return (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={`relative px-6 py-3 rounded-xl flex items-center gap-3 transition-colors duration-300 z-10 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <Motion.div
                                        layoutId="stt-active-tab"
                                        className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className="w-5 h-5 relative z-10" />
                                <div className="flex items-center gap-1.5 relative z-10">
                                    <span className="font-semibold text-sm tracking-wide">{tab.label}</span>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* Outlet for STT sub-pages with simple fade transition */}
            <div className="w-full max-w-5xl relative">
                <AnimatePresence mode="wait">
                    <Motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </Motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
