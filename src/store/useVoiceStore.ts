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

            setRecording: (isRecording) => set({ isRecording }),

            toggleVoiceMode: () => set((state) => ({ isVoiceMode: !state.isVoiceMode })),

            toggleContinuousListening: () => set((state) => ({ isContinuousListening: !state.isContinuousListening })),

            setSelectedVoice: (selectedVoice) => set({ selectedVoice }),

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
                set({ isSpeaking: false });
            },

            speak: async (text: string, onEnd?: () => void) => {
                // Sanitize text to remove markdown, symbols and avoid reading punctuation literally
                const sanitizeTextForSpeech = (input: string): string => {
                    return input
                        // Remove URLs to avoid character-by-character reading of dots/slashes
                        .replace(/https?:\/\/\S+/g, 'enlace')
                        // Remove markdown symbols (asterisks, underscores, headers, etc)
                        .replace(/\*{1,3}/g, '')
                        .replace(/_{1,3}/g, '')
                        .replace(/#{1,6}\s/g, '')
                        .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'un bloque de código')
                        .replace(/>\s/g, '')
                        // Remove grouping symbols that might be read literally
                        .replace(/[()\[\]{}|\\\/]/g, ' ')
                        // Remove dashes used as bullets but keep them for negative numbers/hyphenated words
                        .replace(/^\s*[-•]\s+/gm, '')
                        // Replace multiple spaces with a single one
                        .replace(/\s+/g, ' ')
                        .trim();
                };

                const cleanText = sanitizeTextForSpeech(text);
                if (!cleanText) return;

                // Stop any current speaking
                get().stopSpeaking();

                const playBrowserTTS = async () => {
                    if (Capacitor.isNativePlatform()) {
                        try {
                            await TextToSpeech.speak({
                                text: cleanText,
                                lang: 'es-ES',
                                rate: 1.0,
                                pitch: 1.0,
                                volume: 1.0,
                            });
                            set({ isSpeaking: false });
                            onEnd?.();
                        } catch (e) {
                            console.error('Capacitor TTS failed', e);
                            set({ isSpeaking: false });
                        }
                        return;
                    }

                    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
                        console.warn('[VOICE] Browser TTS not supported or SpeechSynthesisUtterance not defined');
                        set({ isSpeaking: false });
                        return;
                    }

                    // Safety check for Android WebView where checking 'in window' might pass but constructor fails
                    try {
                        const testUtterance = new SpeechSynthesisUtterance("test");
                    } catch (e) {
                        console.warn('[VOICE] SpeechSynthesisUtterance constructor failed:', e);
                        set({ isSpeaking: false });
                        return;
                    }

                    const utterance = new SpeechSynthesisUtterance(cleanText);

                    const getVoicesLoaded = (): Promise<SpeechSynthesisVoice[]> => {
                        return new Promise((resolve) => {
                            let voices = window.speechSynthesis.getVoices();
                            if (voices.length !== 0) {
                                resolve(voices);
                            } else {
                                window.speechSynthesis.onvoiceschanged = () => {
                                    voices = window.speechSynthesis.getVoices();
                                    resolve(voices);
                                };
                            }
                        });
                    };

                    getVoicesLoaded().then(voices => {
                        // Standardize language detection
                        const isSpanish = /[áéíóúñ]/i.test(text) || navigator.language.startsWith('es');

                        // Prioritize high-quality neural voices for Spanish
                        let voice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Mujer') || v.name.includes('Helena')));

                        if (!voice && isSpanish) {
                            voice = voices.find(v => v.lang.startsWith('es'));
                        }

                        if (!voice) {
                            const voiceName = get().selectedVoice;
                            voice = voices.find(v => v.name.includes(voiceName)) || voices[0];
                        }

                        if (voice) utterance.voice = voice;

                        utterance.rate = 1.05; // Slightly faster for natural feel
                        utterance.pitch = 1.0;
                        utterance.volume = 1.0;
                        utterance.lang = isSpanish ? 'es-ES' : (voice?.lang || 'en-US');

                        utterance.onstart = () => {
                            console.log(`[VOICE] Speaking in ${utterance.lang} using ${voice?.name}`);
                            set({ isSpeaking: true });
                        };

                        utterance.onend = () => {
                            set({ isSpeaking: false, currentUtterance: null });
                            if (onEnd) onEnd();
                        };

                        utterance.onerror = (err) => {
                            console.error('[VOICE] Error in speech synthesis:', err);
                            set({ isSpeaking: false, currentUtterance: null });
                        };

                        set({ currentUtterance: utterance });
                        window.speechSynthesis.speak(utterance);
                    });
                };

                // Try ElevenLabs if configured
                try {
                    const voiceIdMap: Record<string, string> = {
                        'Katerina': 'EXAVITQu4vr4xnSDxMaL',
                        'Momo': 'ThT5KcBe7VKqLNo943fj',
                        'Sunny': 'pMsS4qc977856WDp5k3p',
                        'Maia': 'z9fAnlkS8qcnwp47usmC',
                        'Jennifer': '21m00Tcm4llvDq8ikWAM'
                    };

                    const selectedName = get().selectedVoice;
                    const voiceId = voiceIdMap[selectedName] || voiceIdMap['Katerina'];

                    const audioData = await elevenlabsClient.speakText(cleanText);
                    if (audioData) {
                        const blob = new Blob([audioData], { type: 'audio/mpeg' });
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        set({ currentAudio: audio, isSpeaking: true });
                        audio.onended = () => {
                            set({ isSpeaking: false, currentAudio: null });
                            if (onEnd) onEnd();
                        };
                        audio.play();
                    } else {
                        playBrowserTTS();
                    }
                } catch (error) {
                    console.error('[VOICE] ElevenLabs failed, falling back to browser TTS:', error);
                    playBrowserTTS();
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
