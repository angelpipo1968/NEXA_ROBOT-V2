import React, { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../store/useVoiceStore';

export const AudioVisualizer = () => {
    const { isSpeaking, currentAudio } = useVoiceStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        if (!isSpeaking || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const bars = 12;
        const barWidth = canvas.width / bars;

        // Setup real analysis if currentAudio exists
        if (currentAudio && !audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                sourceRef.current = audioContextRef.current.createMediaElementSource(currentAudio);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
                analyserRef.current.fftSize = 64; // Small for few bars
            } catch (err) {
                console.error("Failed to setup audio analysis:", err);
            }
        }

        // State for fallback animation
        const barHeights = new Array(bars).fill(0);
        const targetHeights = new Array(bars).fill(0);
        const dataArray = analyserRef.current ? new Uint8Array(analyserRef.current.frequencyBinCount) : null;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#a78bfa');
            gradient.addColorStop(1, '#7c3aed');
            ctx.fillStyle = gradient;

            if (analyserRef.current && dataArray) {
                analyserRef.current.getByteFrequencyData(dataArray);
                // Use real data
                for (let i = 0; i < bars; i++) {
                    const value = dataArray[i * 2] || 0; // Skip some frequencies
                    const height = (value / 255) * canvas.height * 0.9;
                    const x = i * barWidth;
                    const centerY = canvas.height / 2;
                    ctx.beginPath();
                    ctx.roundRect(x + 2, centerY - height / 2, barWidth - 3, Math.max(height, 2), 4);
                    ctx.fill();
                }
            } else {
                // Fallback simulation (Random/Perlin)
                for (let i = 0; i < bars; i++) {
                    if (Math.abs(barHeights[i] - targetHeights[i]) < 1) {
                        targetHeights[i] = Math.random() * canvas.height * 0.8 + (canvas.height * 0.2);
                    }
                    barHeights[i] += (targetHeights[i] - barHeights[i]) * 0.2;
                    const height = barHeights[i];
                    const x = i * barWidth;
                    const centerY = canvas.height / 2;
                    ctx.beginPath();
                    ctx.roundRect(x + 2, centerY - height / 2, barWidth - 3, height, 4);
                    ctx.fill();
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isSpeaking, currentAudio]);

    if (!isSpeaking) return null;

    return (
        <canvas
            ref={canvasRef}
            width={100}
            height={40}
            className="opacity-90 transition-opacity duration-300 pointer-events-none"
        />
    );
};
