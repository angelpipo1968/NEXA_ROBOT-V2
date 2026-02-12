import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { Hexagon, Power, Terminal, Cpu, Database, Wifi } from 'lucide-react';
import { NexaLogo } from '../ui/NexaLogo';
import { NexaAvatar } from '../ui/NexaAvatar';

export const WelcomeScreen = () => {
    const { userName, hasGreeted, setHasGreeted } = useChatStore();
    const [isVisible, setIsVisible] = useState(true);
    const [bootStep, setBootStep] = useState(1);
    const [bootText, setBootText] = useState<string[]>([]);

    useEffect(() => {
        if (hasGreeted) {
            setIsVisible(false);
            return;
        }
    }, [hasGreeted]);

    const handleStart = async () => {
        setHasGreeted(true);
        const greeting = `Hola ${userName || 'Creador'}, sistemas en línea.`;
        // speak greeting if needed
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] text-white font-mono overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            >
                {/* Ambient Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,rgba(0,0,0,0)_70%)] opacity-40" />

                {/* MAIN WELCOME (Step 1) */}
                <AnimatePresence>
                    {bootStep === 1 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1.2, ease: "circOut" }}
                            className="flex flex-col items-center gap-10 z-10"
                        >
                            {/* Holographic Logo Container */}
                            <div className="relative group cursor-pointer">
                                {/* Rotating Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-8 border border-dashed border-cyan-500/20 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 border border-cyan-500/30 rounded-full"
                                />

                                {/* Core Glow */}
                                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />

                                {/* Hexagon Icon -> Replaced with Nexa Avatar */}
                                <div className="relative bg-[#050505] p-6 rounded-full border border-cyan-500/50 shadow-[0_0_50px_rgba(0,229,255,0.4)]">
                                    <NexaAvatar state="logo" size={128} className="filter drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]" />
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};
