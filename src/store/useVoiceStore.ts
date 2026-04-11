import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { elevenlabsClient } from '@/lib/elevenlabs';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

interface VoiceState {
    voiceEnabled: boolean;
    selectedVoice: string;
    isRecording: boolean;
    isVoiceMode: boolean;
    isSpeaking: boolean;
    isContinuousListening: boolean;
    currentAudio: HTMLAudioElement | null;
    currentUtterance: SpeechSynthesisUtterance | null;

    toggleVoice: () => void;
    setRecording: (isRecording: boolean) => void;
    toggleVoiceMode: () => void;
    toggleContinuousListening: () => void;
    setSelectedVoice: (voice: string) => void;
    stopSpeaking: () => void;
    speak: (text: string, onEnd?: () => void) => Promise<void>;
}

export const useVoiceStore = create<VoiceState>()(
    persist(
        (set, get) => ({
            voiceEnabled: false,
            selectedVoice: 'Katerina',
            isRecording: false,
            isVoiceMode: false,
            isSpeaking: false,
            isContinuousListening: false,
            currentAudio: null,
            currentUtterance: null,

            toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

            setRecording: (isRecording: boolean) => set({ isRecording }),

            toggleVoiceMode: () => set((state) => ({ isVoiceMode: !state.isVoiceMode })),

            toggleContinuousListening: () => set((state) => ({ isContinuousListening: !state.isContinuousListening })),

            setSelectedVoice: (selectedVoice: string) => set({ selectedVoice }),

            stopSpeaking: () => {
                const { currentAudio, currentUtterance } = get();
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    set({ currentAudio: null });
                }
                if (currentUtterance) {
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                    }
                    set({ currentUtterance: null });
                }
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
                // Also stop Capacitor TTS if on native
                if (Capacitor.isNativePlatform()) {
                    TextToSpeech.stop().catch(() => {});
                }
                set({ isSpeaking: false });
            },

            speak: async (text: string, onEnd?: () => void) => {
                // Sanitize text — remove markdown, URLs, symbols for natural TTS
                const sanitize = (input: string): string =>
                    input
                        .replace(/https?:\/\/\S+/g, 'enlace')
                        .replace(/\*{1,3}/g, '')
                        .replace(/_{1,3}/g, '')
                        .replace(/#{1,6}\s/g, '')
                        .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'un bloque de código')
                        .replace(/>\s/g, '')
                        .replace(/[()[\]{}|\\\/]/g, ' ')
                        .replace(/^\s*[-•]\s+/gm, '')
                        .replace(/\s+/g, ' ')
                        .trim();

                const cleanText = sanitize(text);
                if (!cleanText) return;

                // Stop current audio/TTS
                get().stopSpeaking();

                // ─── Android (Capacitor Native TTS) ──────────────────────
                if (Capacitor.isNativePlatform()) {
                    set({ isSpeaking: true });
                    try {
                        await TextToSpeech.speak({
                            text: cleanText,
                            lang: 'es-ES',
                            rate: 1.0,
                            pitch: 1.0,
                            volume: 1.0,
                        });
                        // speak() resolves when TTS finishes on Android ✅
                        set({ isSpeaking: false });
                        onEnd?.();
                    } catch (e) {
                        console.error('[VOICE] Capacitor TTS error:', e);
                        set({ isSpeaking: false });
                        onEnd?.();
                    }
                    return;
                }

                // ─── Web: Try ElevenLabs first ───────────────────────────
                const elevenKey = (window as any).__VITE_ELEVENLABS_API_KEY__ ??
                    import.meta.env?.VITE_ELEVENLABS_API_KEY;

                if (elevenKey) {
                    try {
                        const audioData = await elevenlabsClient.speakText(cleanText);
                        if (audioData) {
                            const blob = new Blob([audioData], { type: 'audio/mpeg' });
                            const url = URL.createObjectURL(blob);
                            const audio = new Audio(url);
                            set({ currentAudio: audio, isSpeaking: true });

                            const cleanup = () => {
                                URL.revokeObjectURL(url);
                                set({ isSpeaking: false, currentAudio: null });
                            };

                            audio.onended = () => { cleanup(); onEnd?.(); };
                            audio.onerror = () => { cleanup(); playBrowserTTS(); };

                            audio.play().catch(() => { cleanup(); playBrowserTTS(); });
                            return;
                        }
                    } catch (_) {
                        console.warn('[VOICE] ElevenLabs unavailable, using browser TTS');
                    }
                }

                // ─── Fallback: Browser Web Speech API ────────────────────
                playBrowserTTS();

                function playBrowserTTS() {
                    if (
                        typeof window === 'undefined' ||
                        !('speechSynthesis' in window) ||
                        !('SpeechSynthesisUtterance' in window)
                    ) {
                        console.warn('[VOICE] Browser TTS not supported');
                        set({ isSpeaking: false });
                        return;
                    }

                    let utterance: SpeechSynthesisUtterance;
                    try {
                        utterance = new SpeechSynthesisUtterance(cleanText);
                    } catch (e) {
                        console.warn('[VOICE] SpeechSynthesisUtterance failed:', e);
                        set({ isSpeaking: false });
                        return;
                    }

                    const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
                        return new Promise((resolve) => {
                            const v = window.speechSynthesis.getVoices();
                            if (v.length > 0) { resolve(v); return; }
                            window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
                            // Timeout fallback in case onvoiceschanged never fires (some browsers)
                            setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
                        });
                    };

                    loadVoices().then((voices) => {
                        const isSpanish = /[áéíóúñ]/i.test(text) || navigator.language.startsWith('es');

                        let voice =
                            voices.find(v => v.lang.startsWith('es') && (v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Mujer') || v.name.includes('Helena'))) ||
                            (isSpanish ? voices.find(v => v.lang.startsWith('es')) : null) ||
                            voices.find(v => v.name.includes(get().selectedVoice)) ||
                            voices[0];

                        if (voice) utterance.voice = voice;
                        utterance.rate = 1.05;
                        utterance.pitch = 1.0;
                        utterance.volume = 1.0;
                        utterance.lang = isSpanish ? 'es-ES' : (voice?.lang || 'en-US');

                        utterance.onstart = () => set({ isSpeaking: true });
                        utterance.onend = () => {
                            set({ isSpeaking: false, currentUtterance: null });
                            onEnd?.();
                        };
                        utterance.onerror = (err) => {
                            if (err.error !== 'interrupted') {
                                console.error('[VOICE] TTS error:', err);
                            }
                            set({ isSpeaking: false, currentUtterance: null });
                        };

                        set({ currentUtterance: utterance });
                        window.speechSynthesis.speak(utterance);
                    });
                }
            },
        }),
        {
            name: 'nexa-voice-storage',
            partialize: (state) => ({
                voiceEnabled: state.voiceEnabled,
                selectedVoice: state.selectedVoice,
            }),
        }
    )
);
