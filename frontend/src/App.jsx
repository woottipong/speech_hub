import { BrowserRouter, NavLink, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight, Waves, MessageSquare, UploadCloud, Radio, Bot, Cloud, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

import STTLayout from './layouts/STTLayout';
import TTSLayout from './layouts/TTSLayout';
import UploadPage from './pages/UploadPage';
import RealtimePage from './pages/RealtimePage';
import AzureTTSPage from './pages/AzureTTSPage';
import GeminiTTSPage from './pages/GeminiTTSPage';
import AnimatedBackground from './components/AnimatedBackground';
import AnimatedLogo from './components/AnimatedLogo';

const navGroups = [
  {
    label: 'STT',
    fullLabel: 'Speech-to-Text',
    icon: Waves,
    basePath: '/stt',
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/10',
    activeBorder: 'border-cyan-500/30',
    activeGlow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]',
    items: [
      { to: '/stt/upload', label: 'File Upload', icon: UploadCloud, desc: 'Audio/video · Azure STT' },
      { to: '/stt/realtime', label: 'Realtime', icon: Radio, desc: 'Live mic · WebSocket' },
    ],
  },
  {
    label: 'TTS',
    fullLabel: 'Text-to-Speech',
    icon: MessageSquare,
    basePath: '/tts',
    color: 'text-purple-400',
    activeBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500/30',
    activeGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    items: [
      { to: '/tts/azure', label: 'Azure Neural', icon: Bot, desc: 'Microsoft HD voices · SSML' },
      { to: '/tts/gemini', label: 'Gemini TTS', icon: Cloud, desc: 'Google AI · Multi-speaker' },
    ],
  },
];

// Global dropdown coordination
let activeDropdown = null;

function NavDropdown({ group }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = location.pathname.startsWith(group.basePath);
  const activeItem = group.items.find(i => location.pathname.startsWith(i.to));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close other dropdowns when this one opens
  const handleOpen = () => {
    if (activeDropdown && activeDropdown !== group.basePath) {
      // Trigger close on other dropdowns via custom event
      document.dispatchEvent(new CustomEvent('closeDropdown', { detail: group.basePath }));
    }
    activeDropdown = group.basePath;
    setOpen(true);
  };

  useEffect(() => {
    const handleCloseDropdown = (e) => {
      if (e.detail !== group.basePath) {
        setOpen(false);
      }
    };
    document.addEventListener('closeDropdown', handleCloseDropdown);
    return () => document.removeEventListener('closeDropdown', handleCloseDropdown);
  }, []);

  const NavIcon = group.icon;

  return (
    <div ref={ref} className="relative z-[100]">
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={handleOpen}
        aria-haspopup="true"
        aria-expanded={open}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none
          ${isActive
            ? `${group.activeBg} border ${group.activeBorder} ${group.activeGlow} text-white`
            : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
      >
        <NavIcon className={`w-3.5 h-3.5 ${isActive ? group.color : ''}`} />
        <span>{group.label}</span>
        {activeItem && (
          <span className="hidden sm:inline text-[9px] font-medium text-white/30 border-l border-white/10 pl-2 ml-1">
            {activeItem.label}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isActive ? 'text-white/40' : 'text-white/20'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full left-0 mt-2 w-56 bg-[#0d0f17]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[1000] backdrop-blur-xl"
          >
            <div className="p-1.5 space-y-0.5">
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const itemActive = location.pathname.startsWith(item.to);
                return (
                  <button
                    key={item.to}
                    onClick={() => { navigate(item.to); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left
                      ${itemActive
                        ? `${group.activeBg} border ${group.activeBorder} text-white`
                        : 'hover:bg-white/5 border border-transparent text-white/50 hover:text-white'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      itemActive ? `${group.activeBg} ${group.activeBorder}` : 'bg-white/[0.03] border-white/5'
                    }`}>
                      <ItemIcon className={`w-4 h-4 ${itemActive ? group.color : 'text-white/30'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black leading-none ${itemActive ? 'text-white' : ''}`}>{item.label}</p>
                      <p className="text-[9px] text-white/20 font-medium mt-1">{item.desc}</p>
                    </div>
                    {itemActive && (
                      <div className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${group.color.replace('text-', 'bg-')}`} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className={`h-px mx-3 ${group.activeBg}`} />
            <div className="px-4 py-2">
              <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">{group.fullLabel}</p>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        className="w-full h-full flex flex-col"
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
            <Route path="azure" element={<AzureTTSPage />} />
            <Route path="gemini" element={<GeminiTTSPage />} />
          </Route>
        </Routes>
      </Motion.div>
    </AnimatePresence>
  );
}

function Header() {
  return (
    <header className="relative w-full z-50 px-4 py-3 flex justify-center">
      <div className="glass-panel rounded-2xl px-2 py-1.5 flex items-center gap-3 border border-white/8 shadow-2xl bg-[#0a0d14]/90 backdrop-blur-xl">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 px-2 py-1 hover:opacity-80 transition-opacity shrink-0">
          <AnimatedLogo className="w-5 h-5" />
          <h1 className="text-sm font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Speech<span className="text-white">Hub</span>
          </h1>
        </NavLink>

        <div className="h-5 w-px bg-white/8 shrink-0" />

        {/* Dropdown Nav */}
        <nav className="flex items-center gap-1">
          {navGroups.map((group) => (
            <NavDropdown key={group.basePath} group={group} />
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
        <main className="relative z-10 flex-1 flex flex-col w-full max-w-[1500px] mx-auto px-4 min-h-0">
          <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
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
