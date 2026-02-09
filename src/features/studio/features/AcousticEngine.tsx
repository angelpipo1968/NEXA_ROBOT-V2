import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Flame, Coffee, Music, Bird, Volume2 } from 'lucide-react';
import { museMemory } from '@/lib/museMemory';

export function AcousticEngine() {
    // Vibe State - Load from memory
    const [activeVibe, setActiveVibe] = useState<'none' | 'rain' | 'fire' | 'cafe' | 'lofi' | 'nature'>(() => {
        const memory = museMemory.load();
        return memory.preferences.activeVibe;
    });
    const [volume, setVolume] = useState(() => {
        const memory = museMemory.load();
        return memory.preferences.volume;
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeNodesRef = useRef<any[]>([]); // Track nodes to stop them
    const activeIntervalRef = useRef<NodeJS.Timeout | null>(null); // Track intervals
    const masterGainRef = useRef<GainNode | null>(null); // Master volume for Web Audio

    const vibes = {
        rain: { isGenerative: true, icon: <CloudRain size={14} />, label: 'Lluvia' },
        fire: { isGenerative: true, icon: <Flame size={14} />, label: 'Fuego' },
        cafe: { url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_34b35e2618.mp3', isGenerative: false, icon: <Coffee size={14} />, label: 'Café' },
        lofi: { url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', isGenerative: false, icon: <Music size={14} />, label: 'Lo-Fi' },
        nature: { isGenerative: true, icon: <Bird size={14} />, label: 'Naturaleza' }
    };

    // --- Generative Audio Engine ---
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Ensure Master Gain (Singleton-ish per context)
        if (!masterGainRef.current) {
            masterGainRef.current = audioContextRef.current.createGain();
            masterGainRef.current.gain.value = volume;
            masterGainRef.current.connect(audioContextRef.current.destination);
        }

        return audioContextRef.current;
    };

    const stopAudio = () => {
        // Stop intervals
        if (activeIntervalRef.current) {
            clearInterval(activeIntervalRef.current);
            activeIntervalRef.current = null;
        }

        // Stop generative nodes
        activeNodesRef.current.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) { /* ignore */ }
        });
        activeNodesRef.current = [];

        // Pause HTML audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const createNoiseBuffer = (ctx: AudioContext) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const playGenerativeVibe = (type: 'rain' | 'fire' | 'nature') => {
        const ctx = initAudioContext();
        const master = masterGainRef.current!; // Guaranteed by init
        const noiseBuffer = createNoiseBuffer(ctx);

        if (type === 'rain') {
            // Pink Noise + LowPass for Heavy Rain
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;
            noiseSrc.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Muffled rain sound

            const gain = ctx.createGain();
            gain.gain.value = 0.8;

            noiseSrc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            noiseSrc.start();

            activeNodesRef.current.push(noiseSrc, gain, filter);
        }
        else if (type === 'fire') {
            // Brown Noise + Crackles
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;
            noiseSrc.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 150;

            const rumbleGain = ctx.createGain();
            rumbleGain.gain.value = 1.5;

            // Crackle Interval
            activeIntervalRef.current = setInterval(() => {
                const crackle = ctx.createOscillator();
                crackle.type = 'sawtooth';
                crackle.frequency.value = 400 + Math.random() * 500;

                const env = ctx.createGain();
                env.gain.value = Math.random() * 0.15; // Random volume

                crackle.connect(env);
                env.connect(master);

                crackle.start();
                env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                crackle.stop(ctx.currentTime + 0.1);
            }, 100 + Math.random() * 300);

            noiseSrc.connect(filter);
            filter.connect(rumbleGain);
            rumbleGain.connect(master);
            noiseSrc.start();

            activeNodesRef.current.push(noiseSrc, filter, rumbleGain);
        }
        else if (type === 'nature') {
            // Wind + Birds
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuffer;
            noiseSrc.loop = true;

            const windFilter = ctx.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.value = 400;
            windFilter.Q.value = 1;

            const windGain = ctx.createGain();
            windGain.gain.value = 0.3;

            // Birds Interval
            activeIntervalRef.current = setInterval(() => {
                if (Math.random() > 0.3) return;

                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(3000 + Math.random() * 1000, ctx.currentTime + 0.2);

                const env = ctx.createGain();
                env.gain.setValueAtTime(0, ctx.currentTime);
                env.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
                env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

                osc.connect(env);
                env.connect(master);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            }, 1000);

            noiseSrc.connect(windFilter);
            windFilter.connect(windGain);
            windGain.connect(master);
            noiseSrc.start();

            activeNodesRef.current.push(noiseSrc, windFilter, windGain);
        }
    };

    const playVibe = (vibeKey: 'none' | 'rain' | 'fire' | 'cafe' | 'lofi' | 'nature') => {
        // Stop everything first
        stopAudio();

        // Toggle off
        if (activeVibe === vibeKey) {
            setActiveVibe('none');
            return;
        }

        // Start new
        setActiveVibe(vibeKey);

        if (vibeKey !== 'none') {
            const vibe = vibes[vibeKey as keyof typeof vibes];
            if (vibe.isGenerative) {
                playGenerativeVibe(vibeKey as 'rain' | 'fire' | 'nature');
            } else {
                // Play External URL
                const externalVibe = vibe as any;
                if (audioRef.current && externalVibe.url) {
                    audioRef.current.src = externalVibe.url;
                    audioRef.current.volume = volume;
                    audioRef.current.play()
                        .then(() => console.log(`Playing ${vibeKey}`))
                        .catch(e => {
                            console.error(`Error playing ${vibeKey}:`, e);
                            alert(`No se pudo reproducir el audio de ${vibe.label}. Intenta de nuevo.`);
                        });
                }
            }
        }
    };

    // Update volume in real-time and save to memory
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        if (masterGainRef.current && audioContextRef.current) {
            // Smooth volume transition
            masterGainRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);
        }
        // Save volume preference
        museMemory.savePreferences({ volume });
    }, [volume]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            stopAudio();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Restoring vibe on mount if saved
    useEffect(() => {
        const memory = museMemory.load();
        if (memory.preferences.activeVibe !== 'none' && activeVibe === 'none') {
            // We don't auto-play on load to avoid browser policies sometimes, but let's try or stay sync
            // For now, let's just respect the internal state if user interacts
        }
    }, []);


    return (
        <div className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-1">
                {Object.entries(vibes).map(([key, vibe]) => (
                    <button
                        key={key}
                        onClick={() => playVibe(key as any)}
                        className={`p-2 rounded-lg transition-all ${activeVibe === key
                                ? 'bg-[var(--vp-accent-purple)] text-white shadow-lg scale-105'
                                : 'text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                            }`}
                        title={vibe.label}
                    >
                        {vibe.icon}
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

            <div className="flex items-center gap-2 px-2 group">
                <Volume2 size={14} className="text-[var(--text-muted)]" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--vp-accent-purple)] transition-all"
                />
            </div>

            <audio ref={audioRef} className="hidden" loop crossOrigin="anonymous" />
        </div>
    );
}
