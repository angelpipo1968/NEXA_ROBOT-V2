import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Brain, Sparkles, Database, Search, Cpu } from 'lucide-react';

interface Memory {
    id: string;
    content: string;
    created_at: string;
    embedding?: any;
    user_id?: string;
}

export function MemoryGalaxy() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit for visual clarity

            if (data) setMemories(data);
        } catch (e) {
            console.error("Error fetching memories:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-[500px] bg-[#0a0f1c] rounded-3xl border border-white/5 relative overflow-hidden flex flex-col group shadow-2xl">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-purple-400">
                        <Brain size={20} />
                        <h3 className="text-lg font-bold font-mono tracking-wider">NEXA BRAIN CORE</h3>
                    </div>
                    <p className="text-xs text-blue-300/60 font-mono uppercase tracking-widest pl-7">
                        {loading ? 'INITIALIZING NEURAL LINK...' : `${memories.length} MEMORY NODES ACTIVE`}
                    </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                    <Cpu size={16} className="text-blue-400 animate-pulse" />
                </div>
            </div>

            {/* Galaxy Canvas */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.15)_0%,_transparent_70%)]" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(20deg)',
                    }}
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <span className="text-xs font-mono text-purple-400">SYNCING HIPPOCAMPUS...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-6 relative z-10 p-12 max-w-4xl">
                        {memories.map((memory, i) => (
                            <motion.div
                                key={memory.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.05, type: 'spring' }}
                                onMouseEnter={() => { setHoveredIndex(i); setSelectedMemory(memory); }}
                                onMouseLeave={() => { setHoveredIndex(null); setSelectedMemory(null); }}
                                className="relative group/node flex items-center justify-center"
                            >
                                {/* Connection Line (Pseudo) */}
                                <div className="absolute top-1/2 left-1/2 w-20 h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 -z-10 transform -translate-x-1/2 rotate-45 opacity-0 group-hover/node:opacity-100 transition-opacity" />

                                {/* The Node */}
                                <div
                                    className={`
                                        w-3 h-3 rounded-full cursor-pointer transition-all duration-300
                                        ${hoveredIndex === i ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-150 ring-4 ring-purple-500/30' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}
                                    `}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Holographic Tooltip Area (Bottom) */}
            <div className="h-40 bg-black/40 backdrop-blur-md border-t border-white/10 p-6 flex flex-col justify-center relative mt-auto z-30">
                <AnimatePresence mode="wait">
                    {selectedMemory ? (
                        <motion.div
                            key={selectedMemory.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                                <Database size={12} />
                                <span>MEMORY_BLOCK_ID: {selectedMemory.id.slice(0, 8)}</span>
                                <span className="text-white/20">|</span>
                                <span>{new Date(selectedMemory.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-medium text-white/90 leading-relaxed font-sans max-w-2xl line-clamp-3">
                                "{selectedMemory.content}"
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-3 text-white/20"
                        >
                            <Search size={20} />
                            <span className="text-sm font-mono tracking-widest">HOVER OVER NODES TO DECRYPT MEMORY DATA</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
