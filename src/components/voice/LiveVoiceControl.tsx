'use client';

import { useState, useEffect, useRef } from 'react';
// Assuming @nexa/voice is linked or we use relative path for now
// Ideally this should be imported from the package
import { VoiceOrchestrator } from '@nexa/voice/src/core/VoiceOrchestrator';

// Stub for Visualizer
class VoiceVisualizer3D {
    constructor(canvas: HTMLCanvasElement) { }
    connect(stream: any) { }
}

export function LiveVoiceControl() {
    const [orchestrator, setOrchestrator] = useState<VoiceOrchestrator | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceMode, setVoiceMode] = useState<'human' | 'ai' | 'future' | 'auto'>('auto');
    const [voiceSettings, setVoiceSettings] = useState({
        speed: 1.0,
        pitch: 1.0,
        emotion: 'neutral',
        effects: {
            reverb: 0.3,
            echo: 0.2,
            modulation: 0.1,
            futuristic: 0.5
        }
    });

    const visualizerRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const init = async () => {
            const voiceOrchestrator = new VoiceOrchestrator();
            await voiceOrchestrator.initialize();
            setOrchestrator(voiceOrchestrator as any);

            if (typeof window !== 'undefined') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };

        init();

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const handleSpeak = async (text: string) => {
        if (!orchestrator || isSpeaking) return;

        setIsSpeaking(true);

        try {
            const session = await orchestrator.speak(text, {
                voiceType: voiceMode,
                speed: voiceSettings.speed,
                emotion: voiceSettings.emotion,
                effects: voiceSettings.effects,
                realTimeProcessing: true,
                visualizer: visualizerRef.current!
            });

            if (visualizerRef.current) {
                const visualizer = new VoiceVisualizer3D(visualizerRef.current);
                visualizer.connect(session.audioStream);
            }

            // Mock event listeners since session is a stub
            console.log('🎤 Comenzando reproducción');
            setTimeout(() => {
                setIsSpeaking(false);
                console.log('✅ Reproducción completada');
            }, 2000);

        } catch (error) {
            setIsSpeaking(false);
            console.error('Error en síntesis de voz:', error);
        }
    };

    const handleLiveEffectChange = (effect: string, value: number) => {
        const newEffects = { ...voiceSettings.effects, [effect]: value };
        setVoiceSettings(prev => ({
            ...prev,
            effects: newEffects as any
        }));

        if (isSpeaking && orchestrator) {
            orchestrator.adjustEffect(effect, value);
        }
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">🎤 Control de Voz Avanzado</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Modo de Voz</h3>
                        <div className="flex gap-2">
                            {['human', 'ai', 'future', 'auto'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setVoiceMode(mode as any)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${voiceMode === mode
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                >
                                    {mode === 'human' && '👤 Humano'}
                                    {mode === 'ai' && '🤖 IA'}
                                    {mode === 'future' && '🚀 Futurista'}
                                    {mode === 'auto' && '⚡ Automático'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-semibold">Velocidad</h3>
                            <span className="text-gray-400">{voiceSettings.speed.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={voiceSettings.speed}
                            onChange={(e) => setVoiceSettings(prev => ({
                                ...prev,
                                speed: parseFloat(e.target.value)
                            }))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>Lento</span>
                            <span>Normal</span>
                            <span>Rápido</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Efectos en Vivo</h3>
                        <div className="space-y-4">
                            {Object.entries(voiceSettings.effects).map(([effect, value]) => (
                                <div key={effect}>
                                    <div className="flex justify-between mb-1">
                                        <span className="capitalize">{effect}</span>
                                        <span className="text-gray-400">{Math.round((value as number) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={value as number}
                                        onChange={(e) => handleLiveEffectChange(
                                            effect,
                                            parseFloat(e.target.value)
                                        )}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => handleSpeak('Hola, soy Nexa AI con voz futurista en vivo')}
                            disabled={isSpeaking}
                            className={`w-full py-3 rounded-lg font-semibold transition-colors ${isSpeaking
                                ? 'bg-gray-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                }`}
                        >
                            {isSpeaking ? '🎤 Hablando...' : '🎤 Probar Voz'}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Visualizador en Vivo</h3>
                    <div className="bg-black rounded-lg p-4">
                        <canvas
                            ref={visualizerRef}
                            className="w-full h-64 rounded"
                        />
                        {isSpeaking && (
                            <div className="mt-4 p-3 bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-green-400">Transmisión en vivo activa</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-400">Modo:</span>
                                        <span className="ml-2">{voiceMode}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Latencia:</span>
                                        <span className="ml-2 text-green-400">{"<"}100ms</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Efectos Activos</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(voiceSettings.effects)
                                .filter(([, value]) => (value as number) > 0.1)
                                .map(([effect, value]) => (
                                    <span
                                        key={effect}
                                        className="px-3 py-1 bg-blue-900/50 rounded-full text-sm"
                                    >
                                        {effect}: {Math.round((value as number) * 100)}%
                                    </span>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
