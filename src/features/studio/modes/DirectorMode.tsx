import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Wand2, Loader2, Image as ImageIcon, Film, Layout, History, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useStudioStore } from '@/lib/stores/useStudioStore';
import { imageService, AspectRatio, ImageQuality } from '@/lib/services/imageService';

const HologramViewer = lazy(() => import('../components/HologramViewer').then(module => ({ default: module.HologramViewer })));

export function DirectorMode() {
    const {
        assets,
        addAsset,
        stories,
        addStory,
        selectedAsset,
        setSelectedAsset,
        aspectRatio,
        setAspectRatio,
        quality,
        setQuality
    } = useStudioStore();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('realistic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'single' | 'story'>('single');
    const [isCoverMode, setIsCoverMode] = useState(false);
    const [isHologramMode, setIsHologramMode] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const fullPrompt = `Style: ${style}. Subject: ${prompt}`;
            const enhancedPrompt = await imageService.enhancePrompt(fullPrompt);

            const url = await imageService.generateFluxImage(enhancedPrompt, {
                aspectRatio,
                quality
            });

            if (!url) throw new Error("No URL returned from service.");

            const newAsset = {
                id: Date.now().toString(),
                url: url,
                prompt: enhancedPrompt,
                timestamp: new Date(),
                type: 'image' as const
            };

            addAsset(newAsset);
            setSelectedAsset(newAsset);
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Error al generar: " + (error as any)?.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateStory = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            // 1. Generate Narrative
            const frames = await imageService.generateStoryBoard(prompt);

            // 2. Generate Images for each frame
            const scenes = await Promise.all(frames.map(async (frame, idx) => {
                const url = await imageService.generateFluxImage(`Style: ${style}. ${frame.prompt}`, {
                    aspectRatio: '16:9',
                    quality: 'standard'
                });

                return {
                    id: `${Date.now()}-${idx}`,
                    url: url || '',
                    prompt: frame.prompt,
                    timestamp: new Date(),
                    type: 'image' as const
                };
            }));

            const newStory = {
                id: Date.now().toString(),
                title: prompt.slice(0, 30) + '...',
                scenes: scenes
            };

            addStory(newStory);
            setSelectedAsset(scenes[0]);
        } catch (error) {
            console.error("Story generation failed:", error);
            alert("Error al generar historia: " + (error as any)?.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 flex bg-[var(--bg-primary)] h-full overflow-hidden">
            {/* Left: Advanced Controls */}
            <div className="w-[420px] border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-secondary)] overflow-hidden shadow-2xl z-10">
                <div className="p-6 border-b border-[var(--border-color)] bg-gradient-to-br from-purple-900/10 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                            <Film className="text-purple-500" size={24} />
                            DIRECTOR MODE
                        </h2>
                        <div className="flex bg-black/40 p-1 rounded-full border border-white/10">
                            <button
                                onClick={() => setActiveTab('single')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${activeTab === 'single' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                FRAME
                            </button>
                            <button
                                onClick={() => setActiveTab('story')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${activeTab === 'story' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                STORY
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {/* Prompt Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Visión Creativa</label>
                                <span className="text-[10px] text-gray-500 font-mono">{prompt.length}/500</span>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={activeTab === 'single' ? "Ej: Un astronauta descubriendo un templo antiguo..." : "Ej: La odisea de un robot buscando su núcleo de energía..."}
                                className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 resize-none transition-all placeholder:text-gray-600 text-white shadow-inner"
                            />
                        </div>

                        {/* Style / Vibe */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Nexa Vibe</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'realistic', label: 'Real' },
                                    { id: 'cyberpunk', label: 'Neon' },
                                    { id: 'anime', label: 'Anime' },
                                    { id: 'watercolor', label: 'Art' },
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={`py-2 text-[9px] font-bold rounded-xl border transition-all uppercase ${style === s.id ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Aspecto</label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="1:1">1:1 Square</option>
                                    <option value="16:9">16:9 Cinema</option>
                                    <option value="9:16">9:16 Mobile</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Calidad</label>
                                <select
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value as ImageQuality)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="draft">Draft (Rápido)</option>
                                    <option value="standard">Standard</option>
                                    <option value="ultra">Ultra (Peluquería)</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <button
                            onClick={activeTab === 'single' ? handleGenerate : handleGenerateStory}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-purple-500/20 active:scale-95 group"
                        >
                            {isGenerating ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                            )}
                            {isGenerating ? 'RENDERIZANDO VISIÓN...' : activeTab === 'single' ? 'GENERAR FRAME' : 'GENERAR HISTORIA'}
                        </button>

                        {/* Recent History */}
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Biblioteca Reciente</label>
                                <button className="text-[9px] font-bold text-purple-400 hover:underline">Ver Todo</button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {assets.slice(0, 8).map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedAsset?.id === asset.id ? 'border-purple-500 shadow-lg scale-95' : 'border-transparent hover:border-white/20'}`}
                                    >
                                        <ImageWithFallback src={asset.url} alt="asset" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'story' && stories.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Stories Guardadas</label>
                                <div className="space-y-2">
                                    {stories.map(story => (
                                        <div key={story.id} className="p-3 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center">
                                                    <Film size={16} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white line-clamp-1">{story.title}</p>
                                                    <p className="text-[9px] text-gray-500">{story.scenes.length} Escenas</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Suggestions */}
                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">IA Visionaria Sugiere</label>
                            <div className="space-y-2">
                                {[
                                    `Una megalópolis flotante en un mundo post-biológico, estilo ${style}`,
                                    `El momento exacto en que una IA cobra conciencia en un laboratorio oscuro`,
                                    `Retrato de una deidad cuántica hecha de luz y fractales`
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(suggestion)}
                                        className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-all line-clamp-2"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[#050505]">
                {/* Background Grid/Matrix effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <AnimatePresence mode="wait">
                    {selectedAsset ? (
                        <motion.div
                            key={selectedAsset.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full h-full flex flex-col items-center justify-center gap-10 z-0"
                        >
                            <div className={`relative group rounded-[40px] shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden border border-white/10 ${isCoverMode ? 'max-h-[85%] aspect-[2/3]' : 'max-h-[75%] aspect-video bg-black/40 backdrop-blur-3xl'}`}>
                                {isHologramMode ? (
                                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-black"><Loader2 className="animate-spin text-purple-500" /></div>}>
                                        <HologramViewer imageUrl={selectedAsset.url} prompt={selectedAsset.prompt} />
                                    </Suspense>
                                ) : (
                                    <ImageWithFallback
                                        src={selectedAsset.url}
                                        alt="output"
                                        className="w-full h-full object-contain"
                                    />
                                )}

                                {/* Overlay Prompt on Hover */}
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                    <p className="text-xs text-purple-300 font-mono mb-2 uppercase tracking-widest">Metadata Fragment</p>
                                    <p className="text-sm text-white/90 font-medium leading-relaxed italic">"{selectedAsset.prompt}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = selectedAsset.url;
                                        link.download = `nexa-${selectedAsset.id}.png`;
                                        link.click();
                                    }}
                                    className="flex items-center gap-2 px-8 py-3 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all uppercase text-xs"
                                >
                                    <Download size={14} />
                                    Exportar Master
                                </button>
                                <button
                                    onClick={() => setIsHologramMode(!isHologramMode)}
                                    className={`px-8 py-3 rounded-full border border-white/10 font-black uppercase text-xs transition-all ${isHologramMode ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    {isHologramMode ? 'Vista 2D' : 'Proyección Holográfica'}
                                </button>
                                <button
                                    onClick={() => setIsCoverMode(!isCoverMode)}
                                    className={`px-6 py-3 rounded-full border border-white/10 font-bold uppercase text-[10px] transition-all ${isCoverMode ? 'bg-indigo-600 text-white border-indigo-400' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    Portrait Mode
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-[30px] flex items-center justify-center mx-auto border border-white/5 animate-pulse">
                                <Sparkles size={40} className="text-purple-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">NEXA CINEMATIC ENGINE</h2>
                            <p className="max-w-md text-gray-500 text-sm leading-relaxed">
                                Define una escena o comienza una narrativa secuencial. Nexa transformará tus ideas en activos visuales de grado producción.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
