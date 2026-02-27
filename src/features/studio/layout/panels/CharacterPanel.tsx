import React, { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useStudioStore } from '@/lib/stores/useStudioStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wand2, Trash2 } from 'lucide-react';

export default function CharacterPanel() {
    const { chapters, activeChapterId } = useStudioStore();
    const { characters, analyzeCharactersInStory, removeCharacter } = useCharacterStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Get the full context to analyze by joining all chapters
    const fullStoryContent = chapters.map(c => c.content).join('\n\n');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await analyzeCharactersInStory(fullStoryContent);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-transparent text-[var(--text-primary)] p-4 overflow-hidden">
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
                        <Users size={20} className="text-purple-400" /> Reparto Principal
                    </h2>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                        IA analizará toda tu obra para extraer perfiles.
                    </p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${isAnalyzing
                        ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] cursor-not-allowed'
                        : 'bg-[var(--vp-accent-purple)]/10 hover:bg-[var(--vp-accent-purple)]/20 text-[var(--vp-accent-purple)] border-[var(--vp-accent-purple)]/30 shadow-lg'
                        }`}
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)] border-t-transparent animate-spin"></div>
                            Analizando manuscrito...
                        </>
                    ) : (
                        <>
                            <Wand2 size={14} />
                            Extraer Personajes
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {characters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-tertiary)]">
                        <Users size={32} className="text-[var(--text-muted)] mb-3" />
                        <h3 className="text-[var(--text-secondary)] text-sm font-bold">Sin registros</h3>
                        <p className="text-[var(--text-muted)] text-[10px] mt-2 px-6">
                            Haz clic en extraer para identificar entidades automáticamente.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {characters.map((char) => (
                            <motion.div
                                key={char.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-4 hover:border-[var(--vp-accent-purple)]/50 transition-all shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                                            {char.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm leading-tight text-[var(--text-primary)]">{char.name}</h3>
                                            <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border inline-block mt-1 flex-shrink-0 ${char.role.toLowerCase().includes('protagonista')
                                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]'
                                                }`}>
                                                {char.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeCharacter(char.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-3 italic">
                                    "{char.description}"
                                </p>

                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {char.traits.map((trait, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-color)] truncate max-w-[100px]"
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
