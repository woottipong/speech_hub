import { Outlet, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function TTSLayout() {
    const location = useLocation();

    return (
        <div className="w-full flex flex-col items-center">
            {/* Main Content Area */}
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
    );
}
