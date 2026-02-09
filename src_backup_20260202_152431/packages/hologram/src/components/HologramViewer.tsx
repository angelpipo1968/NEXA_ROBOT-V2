'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HologramSystem } from '../core/HologramSystem';

interface HologramViewerProps {
    character?: any;
    environment?: any;
    interactive?: boolean;
    voiceEnabled?: boolean;
}

export function HologramViewer({
    character,
    environment,
    interactive = true,
    voiceEnabled = true
}: HologramViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [system, setSystem] = useState<HologramSystem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canvasRef.current) return;

        const sys = new HologramSystem();
        sys.attach(canvasRef.current);

        sys.initialize(character || {}, environment || {})
            .then(() => {
                setSystem(sys);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to init hologram", err);
                setIsLoading(false);
            });

        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleGreet = () => {
        system?.playAnimation('greet');
        system?.speak("Hola, estoy listo.");
    };

    const handleTalk = () => {
        system?.playAnimation('talk');
        system?.speak("Esto es una prueba de sincronización de voz.");
    };

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden min-h-[400px]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-t-2 border-cyan-500 rounded-full animate-spin mb-2"></div>
                        <span>Initializing Hologram System...</span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                <button onClick={handleGreet} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    Greet
                </button>
                <button onClick={handleTalk} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                    Talk
                </button>
            </div>
        </div>
    );
}
