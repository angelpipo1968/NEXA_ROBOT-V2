import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { Hexagon, Power, Terminal, Cpu, Database, Wifi } from 'lucide-react';

export const WelcomeScreen = () => {
    const { userName, hasGreeted, setHasGreeted, speak } = useChatStore();
    const [isVisible, setIsVisible] = useState(true);
    const [bootStep, setBootStep] = useState(0);
    const [bootText, setBootText] = useState<string[]>([]);

    // Boot sequence logs
    const bootLogs = [
        "INITIALIZING KERNEL...",
        "LOADING MEMORY MODULES...",
        "ESTABLISHING NEURAL LINK...",
        "SYNCING QUANTUM STATES...",
        "NEXA OS READY."
    ];

    useEffect(() => {
        if (hasGreeted) {
            setIsVisible(false);
            return;
        }

        // Simulate boot sequence
        let delay = 0;
        bootLogs.forEach((log, index) => {
            delay += Math.random() * 300 + 400; // Random delay between 400-700ms
            setTimeout(() => {
                setBootText(prev => [...prev, log]);
                if (index === bootLogs.length - 1) {
                    setTimeout(() => setBootStep(1), 500); // Transition to main screen
                }
            }, delay);
        });
    }, [hasGreeted]);

    const handleStart = async () => {
        setHasGreeted(true);
        const greeting = `Hola ${userName || 'Creador'}, sistemas en línea.`;
        try {
            await speak(greeting);
        } catch (e) {
            console.error("Speech handling failed", e);
        }
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

                {/* BOOT SEQUENCE (Step 0) */}
                <AnimatePresence>
                    {bootStep === 0 && (
                        <motion.div
                            className="w-full max-w-md p-6 z-10"
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
                        >
                            <div className="flex items-center gap-2 mb-4 text-cyan-500/80 border-b border-cyan-900/30 pb-2">
                                <Terminal size={14} />
                                <span className="text-xs tracking-widest">BOOT_SEQUENCE_V4.2</span>
                            </div>
                            <div className="space-y-1 font-mono text-xs md:text-sm text-cyan-100/70 h-48">
                                {bootText.map((text, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-cyan-500">➜</span>
                                        {text}
                                    </motion.div>
                                ))}
                                <div className="animate-pulse w-2 h-4 bg-cyan-500 inline-block align-middle ml-1" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                                {/* Hexagon Icon */}
                                <div className="relative bg-[#050505] p-6 rounded-full border border-cyan-500/50 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                                    <Hexagon size={64} className="text-cyan-400 fill-cyan-950/50" />
                                </div>

                                {/* Floating Stat Chips */}
                                <motion.div
                                    initial={{ x: -50, opacity: 0 }} animate={{ x: -80, opacity: 1 }} transition={{ delay: 0.5 }}
                                    className="absolute top-0 left-0 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-cyan-900/50 text-[10px] text-cyan-300"
                                >
                                    <Cpu size={10} /> <span>CPU: OPTIMAL</span>
                                </motion.div>
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }} animate={{ x: 80, opacity: 1 }} transition={{ delay: 0.7 }}
                                    className="absolute bottom-0 right-0 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-cyan-900/50 text-[10px] text-cyan-300"
                                >
                                    <Wifi size={10} /> <span>NET: SECURE</span>
                                </motion.div>
                            </div>

                            {/* Main Title Block */}
                            <div className="text-center space-y-4">
                                <motion.h1
                                    className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900"
                                    style={{ textShadow: "0 0 40px rgba(0,229,255,0.3)" }}
                                >
                                    NEXA OS
                                </motion.h1>
                                <p className="text-cyan-500/60 tracking-[0.5em] text-xs uppercase font-semibold">
                                    Advanced Artificial Intelligence
                                </p>
                            </div>

                            {/* Action Button */}
                            <motion.button
                                onClick={handleStart}
                                whileHover={{ scale: 1.05, letterSpacing: "3px" }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-none"
                            >
                                <div className="absolute inset-0 w-0 bg-cyan-500 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10" />
                                <div className="absolute inset-0 border-y border-cyan-800/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                <div className="absolute inset-0 border-x border-cyan-800/50 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                                <span className="relative flex items-center gap-3 text-cyan-400 font-bold tracking-[2px] text-sm group-hover:text-cyan-200 transition-colors">
                                    <Power size={18} />
                                    INITIALIZE_SYSTEM
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Details */}
                <div className="absolute bottom-10 flex justify-between w-full max-w-4xl px-10 text-[10px] text-cyan-900/60 font-mono">
                    <div>ID: 8X-992-ALPHA</div>
                    <div>MEMORY: ACTIVE</div>
                    <div>STATUS: STANDBY</div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
