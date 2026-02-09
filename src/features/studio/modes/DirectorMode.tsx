import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useStudioStore } from '@/lib/stores/useStudioStore';
import { geminiClient } from '@/lib/gemini';

import { HologramViewer } from '../components/HologramViewer';

// Extracted from StudioModule types
interface GeneratedAsset {
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
    type: 'image' | 'render';
}

export function DirectorMode() {
    // Access global store
    const {
        assets,
        addAsset,
        selectedAsset,
        setSelectedAsset
    } = useStudioStore();

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCoverMode, setIsCoverMode] = useState(false);
    const [isHologramMode, setIsHologramMode] = useState(false);

    const handleGenerate = async (overridePrompt?: string) => {
        const promptToUse = overridePrompt || prompt;
        if (!promptToUse.trim()) return;

        setIsGenerating(true);
        try {
            // Real call to Pollinations via geminiClient
            const url = await geminiClient.generateImage(promptToUse);

            if (!url || url.includes('undefined')) {
                throw new Error("Failed to generate a valid image URL.");
            }

            const newAsset: GeneratedAsset = {
                id: Date.now().toString(),
                url: url,
                prompt: promptToUse,
                timestamp: new Date(),
                type: 'image'
            };

            addAsset(newAsset);
            setSelectedAsset(newAsset);
            // Auto switch to hologram view for "wow" factor if it's the first asset
            if (assets.length === 0) {
                setIsHologramMode(true);
            }
        } catch (error) {
            console.error("Generation failed:", error);
            alert("No se pudo generar la imagen. Por favor intenta de nuevo. " + (error as any)?.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadAsset = async () => {
        if (!selectedAsset) return;
        try {
            const response = await fetch(selectedAsset.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexa-vision-${selectedAsset.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading asset:", error);
            // Fallback: Open in new tab
            window.open(selectedAsset.url, '_blank');
        }
    };

    return (
        <div className="flex-1 flex bg-[var(--bg-primary)] h-full overflow-hidden">
            {/* Left: Controls & History */}
            <div className="w-[400px] border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-secondary)]">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
                        <Sparkles size={24} className="text-purple-500" />
                        Nexa Vision
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Generador de Arte Concept</p>
                </div>

                {/* Prompt Input */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Prompt Creativo</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe tu visión...(ej: Cyberpunk city, neon rain, detailed)"
                            className="w-full h-32 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 resize-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleGenerate()}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex-1 py-3 bg-[var(--vp-accent-purple)] hover:brightness-110 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                            {isGenerating ? 'Generando...' : 'Generar Arte'}
                        </button>
                    </div>
                </div>

                {/* Recent Assets */}
                <div className="flex-1 overflow-y-auto p-6 border-t border-[var(--border-color)]">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 block flex items-center gap-2">
                        <ImageIcon size={12} /> Galería Reciente
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {assets.slice(0, 6).map((asset) => (
                            <div
                                key={asset.id}
                                onClick={() => setSelectedAsset(asset)}
                                className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedAsset?.id === asset.id ? 'border-[var(--vp-accent-purple)]' : 'border-transparent hover:border-purple-500/50'}`}
                            >
                                <ImageWithFallback
                                    src={asset.url}
                                    alt={asset.prompt}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        {assets.length === 0 && (
                            <div className="col-span-2 py-8 text-center text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border-color)] rounded-xl">
                                Sin activos generados
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Canvas Preview */}
            <div className="flex-1 p-8 flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <AnimatePresence mode="wait">
                    {selectedAsset ? (
                        <motion.div
                            key={selectedAsset.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 p-8 flex flex-col items-center justify-center gap-8"
                        >
                            <div className={`relative group rounded-2xl shadow-2xl overflow-hidden border border-white/5 ${isCoverMode ? 'max-h-[85%] aspect-[2/3]' : 'max-h-[70%] aspect-square'}`}>
                                {isHologramMode ? (
                                    <HologramViewer imageUrl={selectedAsset.url} prompt={selectedAsset.prompt} />
                                ) : (
                                    <>
                                        <ImageWithFallback
                                            src={selectedAsset.url}
                                            alt={selectedAsset.prompt}
                                            className="w-full h-full object-contain bg-black/50 backdrop-blur-sm"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                                            <p className="text-white/90 text-sm font-medium text-center line-clamp-2">{selectedAsset.prompt}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleDownloadAsset}
                                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
                                >
                                    <Download size={18} />
                                    Descargar Master
                                </button>
                                <button
                                    onClick={() => setIsCoverMode(!isCoverMode)}
                                    className={`px-4 py-3 rounded-full font-medium border border-[var(--border-color)] hover:bg-white/10 transition-all ${isCoverMode ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)]'}`}
                                >
                                    {isCoverMode ? 'Modo Portada: ON' : 'Modo Portada: OFF'}
                                </button>
                                <button
                                    onClick={() => setIsHologramMode(!isHologramMode)}
                                    className={`px-4 py-3 rounded-full font-medium border border-[var(--border-color)] hover:bg-white/10 transition-all ${isHologramMode ? 'bg-[var(--vp-accent-purple)] text-white' : 'text-[var(--text-secondary)]'}`}
                                >
                                    {isHologramMode ? 'Ver en 2D' : 'Ver Holograma 3D'}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4 bg-black/40 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl max-w-lg mx-auto"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                                <Sparkles size={40} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </div>
                            <h3 className="text-3xl font-bold text-white drop-shadow-md">Canvas Visionaria</h3>
                            <p className="text-gray-200 text-lg max-w-md mx-auto leading-relaxed">
                                Selecciona un activo o genera uno nuevo para comenzar a visualizar el universo de tu historia.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
