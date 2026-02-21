import { Outlet } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function STTLayout() {
    return (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
            {/* Page content */}
            <div className="w-full flex-1 min-h-0 flex flex-col relative">
                <AnimatePresence mode="wait">
                    <Motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full flex flex-col"
                    >
                        <Outlet />
                    </Motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
