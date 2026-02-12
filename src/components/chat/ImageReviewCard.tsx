import React from 'react';
import { Sparkles, Camera, Palette, Zap, Layers, Maximize2 } from 'lucide-react';

interface ReviewData {
    title: string;
    description: string;
    technicalSpecs: {
        resolution: string;
        model: string;
        seed: string;
        steps?: string;
    };
    artisticAnalysis: {
        lighting: string;
        composition: string;
        colorPalette: string[];
        mood: string;
    };
    prompt: string;
}

export function ImageReviewCard({ data }: { data: ReviewData }) {
    return (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            {/* Glossy Header Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[var(--vp-accent-purple)]">
                            <Sparkles size={16} className="animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Cinematic Review</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{data.title}</h3>
                    </div>
                    <div className="flex -space-x-2">
                        {data.artisticAnalysis.colorPalette.map((color, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-gray-900 shadow-inner"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Description */}
                <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-[var(--vp-accent-purple)]/30 pl-4">
                    "{data.description}"
                </p>

                {/* Grid Analysis */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Camera size={14} className="text-blue-400" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Lighting & Composition</span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="text-[10px] text-gray-500 font-medium">Lighting</div>
                                <div className="text-xs text-gray-200">{data.artisticAnalysis.lighting}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 font-medium">Composition</div>
                                <div className="text-xs text-gray-200">{data.artisticAnalysis.composition}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Palette size={14} className="text-purple-400" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Atmosphere & Mood</span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="text-[10px] text-gray-500 font-medium">Mood</div>
                                <div className="text-xs text-gray-200">{data.artisticAnalysis.mood}</div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Cinematic</span>
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Hyper-real</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Specs Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                            <Layers size={12} />
                            <span>{data.technicalSpecs.model}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap size={12} />
                            <span>Seed: {data.technicalSpecs.seed}</span>
                        </div>
                    </div>
                    <div className="text-gray-400 font-mono">
                        {data.technicalSpecs.resolution}
                    </div>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
        </div>
    );
}
