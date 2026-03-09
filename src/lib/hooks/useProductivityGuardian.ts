import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProductivityTip {
    id: string;
    text: string;
    timestamp: number;
    urgency: 'low' | 'medium' | 'high';
}

export interface FocusSession {
    startTime: number;
    duration: number; // minutes
    type: 'deep' | 'distracted';
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: number;
    requirement: number; // minutes
}

import { useAchievementStore } from '../stores/useAchievementStore';

export function useProductivityGuardian(active: boolean, extremeFocus: boolean) {
    const [tips, setTips] = useState<ProductivityTip[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [deepWorkMinutes, setDeepWorkMinutes] = useState(0);
    const [mentalState, setMentalState] = useState<'calm' | 'focused' | 'strained'>('calm');

    // Achievement Store Integration
    const {
        achievements,
        checkAchievements,
        setAnnounceCallback
    } = useAchievementStore();

    const audioContextRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

    const announceAchievement = useCallback((name: string) => {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Merit Unlocked: ${name}. This is Aurora. Your neural performance is exceptional.`;

        // Find a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('helena') ||
            v.name.toLowerCase().includes('sabina') ||
            v.name.toLowerCase().includes('monica')
        );

        if (femaleVoice) msg.voice = femaleVoice;
        msg.pitch = 1.1;
        msg.rate = 1.0;
        msg.volume = 0.7;
        window.speechSynthesis.speak(msg);
    }, []);

    // Set Aurora Announce Callback on Mount
    useEffect(() => {
        setAnnounceCallback(announceAchievement);
    }, [announceAchievement, setAnnounceCallback]);

    // Aurora Greeting for Extreme Focus (omitted for brevity in replacement, but keep it)
    useEffect(() => {
        if (active && extremeFocus) {
            const msg = new SpeechSynthesisUtterance("Aurora Protocol engaged. System silenced. Focus on your creation.");
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
            if (femaleVoice) msg.voice = femaleVoice;
            msg.pitch = 1.1;
            msg.rate = 1.0;
            window.speechSynthesis.speak(msg);
        }
    }, [active, extremeFocus]);

    // White Noise Generator
    const toggleWhiteNoise = useCallback((play: boolean) => {
        if (play) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (noiseNodeRef.current) return;

            const bufferSize = 2 * audioContextRef.current.sampleRate;
            const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = audioContextRef.current.createBufferSource();
            whiteNoise.buffer = buffer;
            whiteNoise.loop = true;

            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = 0.05; // Very subtle

            whiteNoise.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            whiteNoise.start();
            noiseNodeRef.current = whiteNoise;
        } else {
            if (noiseNodeRef.current) {
                noiseNodeRef.current.stop();
                noiseNodeRef.current = null;
            }
        }
    }, []);

    const setWindowsFocusMode = async (enabled: boolean) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/system/focus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            });
        } catch (e) {
            console.warn("Could not set system focus mode", e);
        }
    };

    const analyzeProductivity = useCallback(async () => {
        if (!active || isAnalyzing) return;
        setIsAnalyzing(true);

        try {
            const visionRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/vision/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: "What is the user doing? Are they in a deep work state (coding, writing) or distracted? Be extremely precise." })
            });
            const visionData = await visionRes.json();

            if (visionData.success) {
                const description = visionData.analysis;
                const isDeepWork = description.toLowerCase().includes('coding') ||
                    description.toLowerCase().includes('programming') ||
                    description.toLowerCase().includes('writing') ||
                    description.toLowerCase().includes('analyzing');

                if (isDeepWork) {
                    setDeepWorkMinutes(m => {
                        const newM = m + 1;
                        checkAchievements(newM, 'minutes');
                        return newM;
                    });
                    setMentalState(extremeFocus ? 'focused' : 'calm');
                } else if (description.toLowerCase().includes('social media') || description.toLowerCase().includes('youtube')) {
                    setMentalState('strained');
                }

                // Trigger Extreme Focus Actions (Audio + System)
                if (extremeFocus && isDeepWork) {
                    toggleWhiteNoise(true);
                    setWindowsFocusMode(true);
                } else {
                    toggleWhiteNoise(false);
                    setWindowsFocusMode(false);
                }

                const llmRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/chat/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `The user spent another minute in focus. Total today: ${deepWorkMinutes} mins. Current state: ${description}. Give a 1-phrase productivity nudge.`,
                        priority: 'speed',
                        requirements: { modelId: 'nexa-local-qwen' }
                    })
                });
                const llmData = await llmRes.json();

                if (llmData.success) {
                    const newTip: ProductivityTip = {
                        id: Math.random().toString(36).substr(2, 9),
                        text: llmData.result.text,
                        timestamp: Date.now(),
                        urgency: isDeepWork ? 'medium' : 'high'
                    };
                    setTips(prev => [newTip, ...prev].slice(0, 5));
                }
            }
        } catch (e) {
            console.error("Guardian analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    }, [active, isAnalyzing, extremeFocus, toggleWhiteNoise, deepWorkMinutes, checkAchievements]);

    const generateMentalHealthReport = async () => {
        const prompt = `Based on a total of ${deepWorkMinutes} minutes of deep work today, generate a 2-paragraph Mental Health & Flow Report. Be insightful, slightly poetic, and mention specific advice for burnout prevention.`;
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/chat/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                priority: 'precise',
                requirements: { modelId: 'nexa-local-qwen' }
            })
        });
        const data = await res.json();
        return data.success ? data.result.text : "Report generation failed.";
    };

    useEffect(() => {
        if (!active) {
            toggleWhiteNoise(false);
            setWindowsFocusMode(false);
            return;
        }
        analyzeProductivity();
        const interval = setInterval(analyzeProductivity, 60000); // 1-minute tracking interval
        return () => clearInterval(interval);
    }, [active, analyzeProductivity, toggleWhiteNoise]);

    return { tips, isAnalyzing, deepWorkMinutes, mentalState, generateMentalHealthReport, achievements };
}
