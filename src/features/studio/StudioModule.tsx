import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenTool,
    Sparkles,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudioStore } from '@/lib/stores/useStudioStore';

// Imported Sub-Components
import { DirectorMode } from './modes/DirectorMode';
import { BookStudio } from './BookStudio';

// Simple Modal Wrapper
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-2xl max-w-lg w-full m-4"
            >
                {children}
            </motion.div>
        </div>
    );
};

export function StudioModule() {
    const navigate = useNavigate();

    // Global Store State
    const {
        mode,
        setMode,
        writingTitle,
    } = useStudioStore();

    // Local UI State
    const [zenMode, setZenMode] = useState(false);

    return (
        <div className={`flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--vp-accent-purple)] selection:text-white overflow-hidden ${zenMode ? 'zen-mode' : ''}`}>

            {/* TOP NAVIGATION BAR (Hidden in Zen Mode) */}
            <AnimatePresence>
                {!zenMode && (
                    <motion.header
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                    Nexa Studio
                                </span>
                                <span className="text-[var(--text-muted)]">/</span>
                                <span className="text-sm font-medium text-[var(--text-secondary)]">{writingTitle}</span>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-color)]">
                            <button
                                onClick={() => setMode('editorial')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'editorial' ? 'bg-[var(--vp-accent-purple)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                <PenTool size={14} /> Editorial
                            </button>
                            <button
                                onClick={() => setMode('vision')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'vision' ? 'bg-[var(--vp-accent-purple)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                <Sparkles size={14} /> Vision
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* User Avatar / Profile would go here */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600" />
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {mode === 'vision' ? (
                        <motion.div
                            key="vision"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full"
                        >
                            <DirectorMode />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editorial"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full h-full"
                        >
                            <BookStudio
                                onToggleZen={() => setZenMode(!zenMode)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
