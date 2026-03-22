'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, Loader2, X } from 'lucide-react';
import { externalAIService } from '@/lib/services/externalAIService';
import { useChatStore } from '@/store/useChatStore';

export const VisionModule = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addTerminalLog } = useChatStore();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        addTerminalLog('[VISION] Enviando imagen al Cortex de 16GB...');
        
        try {
            const res = await externalAIService.processVision(image);
            if (res) {
                setResult(res.result);
                addTerminalLog('[VISION] Análisis completado con éxito.');
            } else {
                setResult("Error al conectar con el cerebro externo.");
            }
        } catch (error) {
            setResult("Fallo en la conexión neural.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Camera className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Vision Cortex</h2>
                        <p className="text-xs text-gray-400">Powered by 16GB External Brain</p>
                    </div>
                </div>
                {image && (
                    <button 
                        onClick={() => { setImage(null); setResult(null); }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {!image ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <Upload className="w-12 h-12 text-gray-500 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-300">Sube una imagen o captura</p>
                            <p className="text-xs text-gray-500 mt-1">Nexa analizará lo que ves</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>
                ) : (
                    <div className="relative flex-1 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <img src={image} alt="Preview" className="w-full h-full object-contain" />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                <p className="text-sm text-purple-400 font-medium animate-pulse">PROCESANDO EN CORTEX EXTERNO...</p>
                            </div>
                        )}
                    </div>
                )}

                {result && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Nexa Vision Insight</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed font-light">
                            {result}
                        </p>
                    </div>
                )}
            </div>

            <button
                disabled={!image || isAnalyzing}
                onClick={analyzeImage}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all ${
                    !image || isAnalyzing 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]'
                }`}
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analizando...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Ejecutar Análisis Cognitivo</span>
                    </>
                )}
            </button>
        </div>
    );
};
