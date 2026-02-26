'use client';

import React, { useState } from 'react';
import { useNexa, Character } from '@/context/NexaContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CharacterPanel() {
    const { characters, analyzeCharactersInStory, removeCharacter } = useNexa();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await analyzeCharactersInStory();
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Reparto de Personajes
                    </h2>
                    <p className="text-gray-400 text-sm">Gestiona y analiza el alma de tu historia</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${isAnalyzing
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                        }`}
                >
                    {isAnalyzing ? (
                        <>
                            <i className="fas fa-circle-notch animate-spin"></i>
                            Analizando...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-wand-magic-sparkles"></i>
                            Extraer de la Obra
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {characters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-users text-gray-600 text-2xl"></i>
                        </div>
                        <h3 className="text-gray-400 font-medium">No hay personajes aún</h3>
                        <p className="text-gray-500 text-sm max-w-xs mt-2">
                            Haz clic en "Extraer de la Obra" para que la IA identifique automáticamente a tus personajes.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {characters.map((char) => (
                                <motion.div
                                    key={char.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative bg-gray-800/40 rounded-xl border border-gray-700/50 p-4 hover:border-blue-500/50 transition-all hover:bg-gray-800/60 shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg">
                                                {char.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{char.name}</h3>
                                                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${char.role.toLowerCase().includes('protagonista')
                                                        ? 'bg-blue-400/10 border-blue-400/20 text-blue-400'
                                                        : 'bg-gray-400/10 border-gray-400/20 text-gray-400'
                                                    }`}>
                                                    {char.role}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeCharacter(char.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-300 line-clamp-2 mb-3 h-10 italic">
                                        "{char.description}"
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {char.traits.map((trait, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[11px] bg-gray-900/50 text-gray-400 px-2 py-1 rounded border border-gray-700/50"
                                            >
                                                {trait}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-700/30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs text-blue-400 hover:underline">Ver ficha completa</button>
                                        <button className="text-xs text-purple-400 hover:underline">Análisis de evolución</button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Banner inferior de IA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                <div className="text-2xl">✨</div>
                <div>
                    <h4 className="text-sm font-semibold text-blue-300">Nexa Insights: Profundidad Psicológica</h4>
                    <p className="text-[11px] text-gray-400">
                        La IA analiza la consistencia tonal y los arcos narrativos para asegurar que tus personajes se sientan vivos.
                    </p>
                </div>
            </div>
        </div>
    );
}
