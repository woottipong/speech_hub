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
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
      <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-6 pointer-events-auto border border-white/10 shadow-2xl bg-black/40">
        <div className="flex items-center gap-2 pl-4 pr-2">
          <AnimatedLogo className="w-6 h-6" />
          <h1 className="text-lg font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Speech<span className="text-white">Hub</span>
          </h1>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <nav className="flex gap-1 pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={false}
              className={({ isActive }) => {
                return `relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${isActive
                  ? 'text-white'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
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
                        className="absolute inset-0 bg-white/10 border border-white/20 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <NavIcon className="w-4 h-4 relative z-10" />
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
      <div className="min-h-screen flex flex-col relative overflow-hidden text-[var(--text-primary)]">

        <AnimatedBackground />

        {/* Floating Header */}
        <Header />

        <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-4 w-full max-w-5xl mx-auto z-10">
          <AnimatedRoutes />
        </main>

        <footer className="relative z-10 text-center text-xs font-medium tracking-widest uppercase text-white/30 py-8 flex items-center justify-center gap-2">
          <span>Powered by Azure & Google Cloud</span>
          <ChevronRight className="w-3 h-3" />
          <span>Speech Intelligence</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
