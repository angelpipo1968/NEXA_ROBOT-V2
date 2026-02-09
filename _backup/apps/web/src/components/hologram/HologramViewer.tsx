
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HologramSystem } from '@nexa/hologram';

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
    const containerRef = useRef<HTMLDivElement>(null);

    const [system, setSystem] = useState<any>(null);
    const [hologram, setHologram] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // 1. Setup Three.js
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 5);

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

        const controls = new OrbitControls(camera, renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // 2. Initialize Hologram System
        const initHologram = async () => {
            const sys = new HologramSystem();
            setSystem(sys);

            const holo = await sys.createInteractiveHologram(character || {}, environment || {});
            setHologram(holo);

            if (holo.model && holo.model.model) {
                scene.add(holo.model.model);
            }
            if (holo.model && holo.model.particleSystem) {
                scene.add(holo.model.particleSystem);
            }

            setIsLoading(false);
        };

        initHologram();

        // Loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black rounded-xl overflow-hidden min-h-[400px]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    Loading Hologram...
                </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <button onClick={() => hologram?.playAnimation('greet')} className="px-3 py-1 bg-blue-600 text-white rounded">
                    Greet
                </button>
                <button onClick={() => hologram?.playAnimation('talk')} className="px-3 py-1 bg-green-600 text-white rounded">
                    Talk
                </button>
            </div>
        </div>
    );
}
