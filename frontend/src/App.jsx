import { BrowserRouter, NavLink, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AudioLines, ChevronRight, Waves, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

import STTLayout from './layouts/STTLayout';
import TTSLayout from './layouts/TTSLayout';
import UploadPage from './pages/UploadPage';
import RealtimePage from './pages/RealtimePage';
import TTSPage from './pages/TTSPage';
import AnimatedBackground from './components/AnimatedBackground';
import AnimatedLogo from './components/AnimatedLogo';

const navItems = [
  { to: '/stt', label: 'Speech-to-Text (STT)', icon: Waves },
  { to: '/tts', label: 'Text-to-Speech (TTS)', icon: MessageSquare },
];

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          {/* Default Redirect to STT Upload */}
          <Route path="/" element={<Navigate to="/stt/upload" replace />} />

          <Route path="/stt" element={<STTLayout />}>
            <Route index element={<Navigate to="upload" replace />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="realtime" element={<RealtimePage />} />
          </Route>

          <Route path="/tts" element={<TTSLayout />}>
            <Route index element={<Navigate to="azure" replace />} />
            <Route path="azure" element={<TTSPage />} />
          </Route>
        </Routes>
      </Motion.div>
    </AnimatePresence>
  );
}

function Header() {
  return (
    <header className="relative w-full z-50 px-4 py-4 flex justify-center">
      <div className="glass-panel rounded-full px-1 py-1 flex items-center gap-6 border border-white/10 shadow-xl bg-[#0a0d14]/80 backdrop-blur-xl">
        <NavLink to="/" className="flex items-center gap-2 pl-4 pr-2 hover:opacity-80 transition-opacity">
          <AnimatedLogo className="w-5 h-5" />
          <h1 className="text-base font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Speech<span className="text-white">Hub</span>
          </h1>
        </NavLink>

        <div className="h-4 w-px bg-white/10" />

        <nav className="flex gap-1 pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={false}
              className={({ isActive }) => {
                return `relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${isActive
                  ? 'text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`;
              }}
            >
              {({ isActive }) => {
                const NavIcon = item.icon;
                return (
                  <>
                    {isActive && (
                      <Motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <NavIcon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col relative bg-[#02040a] text-[var(--text-primary)] overflow-hidden">

        {/* Absolute Background Layer */}
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
        </div>

        {/* Static Header — No more floating overlap */}
        <div className="relative z-50 shrink-0">
          <Header />
        </div>

        {/* Main Content Area — Fills remaining height, internal scroll only */}
        <main className="relative z-10 flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 min-h-0">
          <div className="flex-1 h-full overflow-y-auto custom-scrollbar py-6">
            <AnimatedRoutes />
          </div>
        </main>

        <footer className="relative z-10 shrink-0 text-center text-[10px] font-medium tracking-widest uppercase text-white/20 py-3 flex items-center justify-center gap-2 border-t border-white/5 bg-black/20">
          <span>Powered by Azure & Google Cloud</span>
          <ChevronRight className="w-2 h-2" />
          <span>Speech Intelligence</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
