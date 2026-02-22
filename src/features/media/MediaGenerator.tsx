import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Image as ImageIcon,
    Video,
    Download,
    Wand2,
    Loader2,
    Type,
    Move,
    Layout,
    Palette,
    ArrowLeft,
    RefreshCw,
    History as HistoryIcon,
    Box,
    Trash2,
    Layers
} from 'lucide-react';
import { imageService, AspectRatio } from '@/lib/services/imageService';
import { useNavigate } from 'react-router-dom';

const HologramViewer = lazy(() => import('@/features/studio/components/HologramViewer').then(module => ({ default: module.HologramViewer })));

interface HistoryItem {
    id: string;
    url: string;
    prompt: string;
    type: 'image' | 'video';
    timestamp: number;
}

const PRESETS = [
    { id: 'none', label: 'Sin Estilo', prompt: '' },
    { id: 'cinematic', label: 'Cinemático', prompt: 'cinematic lighting, ultra-realistic, 8k, dramatic shadows', icon: '🎬' },
    { id: 'anime', label: 'Anime', prompt: 'anime style, vibrant colors, high quality digital art, studio ghibli vibes', icon: '🌸' },
    { id: '3d', label: '3D Render', prompt: 'octane render, unreal engine 5, toy-like, tilt-shift, cute', icon: '🧊' },
    { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic, rainy streets, blade runner style', icon: '🌃' },
    { id: 'artistic', label: 'Artístico', prompt: 'abstract art style, van gogh starry night texture, oil painting, expressive', icon: '🎨' },
    { id: 'portrait', label: 'Retrato', prompt: 'professional portrait photography, 85mm lens, f/1.8, bokeh, studio lighting', icon: '📸' },
    { id: 'macro', label: 'Macro', prompt: 'macro photography, extreme close-up, intricate details, depth of field', icon: '🔍' }
];

const MODELS = [
    { id: 'flux', label: 'Flux (Transformer)', description: 'Calidad Máxima' },
    { id: 'flux-realism', label: 'Realism (CNN+)', description: 'Fotorealismo' },
    { id: 'turbo', label: 'Turbo (GAN/Diff)', description: 'Velocidad Extrema' }
];

const SUBJECTS = [
    { id: 'auto', label: 'Auto' },
    { id: 'person', label: 'Persona' },
    { id: 'landscape', label: 'Paisaje' },
    { id: 'object', label: 'Objeto' }
];

export default function MediaGenerator() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [type, setType] = useState<'image' | 'video'>('image');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [selectedPreset, setSelectedPreset] = useState('none');
    const [selectedModel, setSelectedModel] = useState('flux');
    const [selectedSubject, setSelectedSubject] = useState('auto');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Simple Editor State
    const [overlayText, setOverlayText] = useState('');
    const [textColor, setTextColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(48);
    const [textX, setTextX] = useState(50); // percentage
    const [textY, setTextY] = useState(80); // percentage

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load history
    useEffect(() => {
        const saved = localStorage.getItem('nexa_media_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Save history
    useEffect(() => {
        localStorage.setItem('nexa_media_history', JSON.stringify(history));
    }, [history]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setGeneratedUrl(null);
        setViewMode('2d');

        try {
            const preset = PRESETS.find(p => p.id === selectedPreset);
            let subjectPrefix = '';
            if (selectedSubject === 'person') subjectPrefix = 'A portrait of ';
            if (selectedSubject === 'landscape') subjectPrefix = 'A landscape view of ';
            if (selectedSubject === 'object') subjectPrefix = 'A detailed object shot of ';

            const basePrompt = `${subjectPrefix}${prompt}`;
            const fullPrompt = preset?.prompt ? `${basePrompt}, ${preset.prompt}` : basePrompt;

            const enhanced = await imageService.enhancePrompt(fullPrompt, type);
            let url = '';

            if (type === 'image') {
                url = await imageService.generateFluxImage(enhanced, { aspectRatio, model: selectedModel });
            } else {
                url = await imageService.generateVideo(enhanced, { aspectRatio });
            }

            setGeneratedUrl(url);

            // Add to history
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                url,
                prompt,
                type,
                timestamp: Date.now()
            };
            setHistory(prev => [newItem, ...prev].slice(0, 20));

        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedUrl) return;

        if (type === 'image' && overlayText) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement('a');
            link.download = `nexa-design-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            window.open(generatedUrl, '_blank');
        }
    };

    const clearHistory = () => {
        if (confirm('¿Borrar todo el historial?')) {
            setHistory([]);
        }
    };

    // Update canvas for live preview
    React.useEffect(() => {
        if (type === 'image' && generatedUrl && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    if (overlayText) {
                        ctx.fillStyle = textColor;
                        ctx.font = `bold ${fontSize * (img.width / 1024)}px Inter, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 10;
                        ctx.fillText(
                            overlayText,
                            (textX / 100) * canvas.width,
                            (textY / 100) * canvas.height
                        );
                    }
                }
            };
            img.src = generatedUrl;
        }
    }, [generatedUrl, overlayText, textColor, fontSize, textX, textY, type]);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden font-outfit">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d14]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
                            NEXA STUDIO PRO
                        </h1>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Generación Mutimedia</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
                        <button
                            onClick={() => { setType('image'); setViewMode('2d'); }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${type === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <ImageIcon size={12} /> Fotos
                        </button>
                        <button
                            onClick={() => { setType('video'); setViewMode('2d'); }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${type === 'video' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Video size={12} /> Videos
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Configuration */}
                <div className="w-[380px] border-r border-white/5 overflow-y-auto custom-scrollbar bg-[#0d0d14]/50 backdrop-blur-md">
                    <div className="p-6 space-y-8">
                        {/* Prompt Input */}
                        <section className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 underline decoration-blue-500/50 underline-offset-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles size={12} className="text-blue-400" /> Prompt Creativo
                            </label>
                            <div className="relative group">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe tu visión..."
                                    className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all placeholder:text-gray-600 shadow-inner"
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => setPrompt('')}
                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                                        title="Limpiar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Presets Galllery */}
                        <section className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 underline decoration-purple-500/50 underline-offset-4 uppercase tracking-[0.2em]">Estilos Artísticos</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setSelectedPreset(preset.id)}
                                        className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedPreset === preset.id ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                                    >
                                        <span className="text-xl">{preset.icon || '✨'}</span>
                                        <span className={`text-[10px] font-bold uppercase ${selectedPreset === preset.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                            {preset.label}
                                        </span>
                                        {selectedPreset === preset.id && (
                                            <motion.div layoutId="preset-active" className="absolute inset-0 rounded-2xl border-2 border-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Dimensions & Generate */}
                        <div className="space-y-6">


                            {/* Model & Subject Selector */}
                            <section className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 underline decoration-green-500/50 underline-offset-4 uppercase tracking-[0.2em]">Tecnología</label>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                        {MODELS.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`p-2 rounded-xl text-[9px] font-black border transition-all flex flex-col items-center gap-1 ${selectedModel === model.id ? 'bg-white/10 border-green-500/50 text-white' : 'border-white/5 text-gray-500'}`}
                                            >
                                                <span className="uppercase">{model.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {SUBJECTS.map(subj => (
                                            <button
                                                key={subj.id}
                                                onClick={() => setSelectedSubject(subj.id)}
                                                className={`p-2 rounded-lg text-[9px] font-bold border transition-all ${selectedSubject === subj.id ? 'bg-white/10 border-blue-500/50 text-white' : 'border-white/5 text-gray-500'}`}
                                            >
                                                {subj.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 underline decoration-pink-500/50 underline-offset-4 uppercase tracking-[0.2em]">Formato de Salida</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={`py-3 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === ratio ? 'bg-white/10 border-pink-500/50 text-white shadow-lg shadow-pink-500/5' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                                {isGenerating ? 'GENERANDO MASTERPIECE...' : `GENERAR ${type.toUpperCase()}`}
                            </button>
                        </div>

                        {/* History Section */}
                        {history.length > 0 && (
                            <section className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <HistoryIcon size={12} /> Historial
                                    </label>
                                    <button onClick={clearHistory} className="text-[8px] font-bold text-gray-600 hover:text-red-400 uppercase">Limpiar</button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {history.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setGeneratedUrl(item.url);
                                                setType(item.type);
                                                setPrompt(item.prompt);
                                                setViewMode('2d');
                                            }}
                                            className={`aspect-square rounded-lg border overflow-hidden transition-all hover:scale-105 ${generatedUrl === item.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/10'}`}
                                        >
                                            <img src={item.url} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[#050508] relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />

                    {/* View Mode Switcher */}
                    {generatedUrl && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 z-30 shadow-2xl">
                            <button
                                onClick={() => setViewMode('2d')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '2d' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Layout size={12} /> Plano
                            </button>
                            <button
                                onClick={() => setViewMode('3d')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '3d' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Box size={12} /> Holograma
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-center space-y-6 p-12 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[40px] opacity-20 blur-2xl animate-pulse" />
                                <div className="relative">
                                    <div className="w-24 h-24 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto" />
                                    <Sparkles className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-[0.1em] uppercase">Procesando Visiones</h2>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Arquitectura de Red Neuronal Activa</p>
                                </div>
                                <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5 shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 15, ease: "linear" }}
                                    />
                                </div>
                            </motion.div>
                        ) : generatedUrl ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative w-full h-full flex items-center justify-center p-4"
                            >
                                {viewMode === '2d' ? (
                                    <div className={`relative shadow-[0_0_100px_rgba(37,99,235,0.15)] rounded-3xl overflow-hidden border border-white/10 group/preview ${aspectRatio === '16:9' ? 'aspect-video w-[900px]' : aspectRatio === '9:16' ? 'aspect-[9/16] h-[700px]' : 'aspect-square h-[650px]'}`}>
                                        {type === 'image' ? (
                                            <>
                                                <canvas ref={canvasRef} className="w-full h-full object-contain hidden" />
                                                <img
                                                    src={generatedUrl}
                                                    alt="Generated"
                                                    className="w-full h-full object-contain bg-black/40"
                                                />
                                                {/* Text Overlay Layer */}
                                                {overlayText && (
                                                    <div
                                                        className="absolute pointer-events-none select-none text-center w-full px-4"
                                                        style={{
                                                            top: `${textY}%`,
                                                            color: textColor,
                                                            fontSize: `${fontSize}px`,
                                                            fontWeight: 'bold',
                                                            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                                            transform: 'translateY(-50%)',
                                                            fontFamily: 'Inter, sans-serif'
                                                        }}
                                                    >
                                                        {overlayText}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <video src={generatedUrl} autoPlay loop muted className="w-full h-full object-cover" />
                                        )}

                                        {/* Download Fab */}
                                        <div className="absolute bottom-6 right-6 opacity-0 group-hover/preview:opacity-100 transition-all scale-90 group-hover/preview:scale-100">
                                            <button
                                                onClick={handleDownload}
                                                className="bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center gap-2 font-black text-xs uppercase"
                                            >
                                                <Download size={18} /> Descargar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full max-w-4xl aspect-[4/3]">
                                        <Suspense fallback={
                                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                                <Loader2 className="animate-spin text-cyan-500" size={48} />
                                                <p className="text-cyan-400 font-bold tracking-[0.2em] uppercase text-xs">Iniciando Motor Holográfico...</p>
                                            </div>
                                        }>
                                            <HologramViewer imageUrl={generatedUrl} prompt={prompt} />
                                        </Suspense>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-10 max-w-sm"
                            >
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-[48px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center mx-auto shadow-inner relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.2),transparent)]" />
                                        <Wand2 size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center animate-bounce">
                                        <Sparkles size={20} className="text-yellow-400" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Estudio Visionario</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed text-sm">
                                        Escribe tu visión creativa y observa cómo Nexa OS la esculpe en realidad digital usando <span className="text-blue-400 font-bold">Flux 1.1</span>.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['Cyberpunk', 'Cinematic', '3D Render', 'UHD Art'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setPrompt(`A masterpiece of ${tag} featuring...`)}
                                            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-white/10 hover:text-white hover:border-blue-500/50 transition-all active:scale-95"
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Panel: Editor Tools (Only if image and not in 3D) */}
                <AnimatePresence>
                    {generatedUrl && type === 'image' && viewMode === '2d' && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-white/5 bg-[#0d0d14]/30 backdrop-blur-md overflow-hidden"
                        >
                            <div className="w-[320px] p-6 space-y-8">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-4">
                                    <Layers size={12} className="text-blue-400" /> Herramientas de Capas
                                </h3>

                                <div className="space-y-6">
                                    {/* Text Overlay */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Type size={14} className="text-pink-500" /> Texto Overlay
                                            </label>
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="w-8 h-8 rounded-lg bg-black border border-white/10 cursor-pointer overflow-hidden"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={overlayText}
                                            onChange={(e) => setOverlayText(e.target.value)}
                                            placeholder="Introduce texto..."
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-pink-500/50 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Typography Controls */}
                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-black uppercase">
                                                <span>Tamaño Fuente</span>
                                                <span className="text-white bg-white/10 px-2 py-0.5 rounded">{fontSize}px</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="250" value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="w-full accent-pink-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Move size={10} /> Posición Vertical</span>
                                                <span className="text-white bg-white/10 px-2 py-0.5 rounded">{textY}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={textY}
                                                onChange={(e) => setTextY(parseInt(e.target.value))}
                                                className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-8 border-t border-white/5">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-4 bg-white text-black hover:bg-gray-200 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5"
                                        >
                                            <Download size={14} /> Finalizar y Guardar
                                        </button>
                                        <p className="text-center text-[8px] text-gray-600 font-bold uppercase mt-4 tracking-tighter">Exportación en UHD 4K (300 DPI)</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

