import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { elevenlabsClient } from '@/lib/elevenlabs';

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
                    window.speechSynthesis.cancel();
                    set({ currentUtterance: null });
                }
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
                set({ isSpeaking: false });
            },

            speak: async (text: string, onEnd?: () => void) => {
                // if (!get().voiceEnabled) return; // Allow clear explicit speak requests (e.g. "Read aloud")

                // Stop any current speaking
                get().stopSpeaking();

                const playBrowserTTS = () => {
                    const utterance = new SpeechSynthesisUtterance(text);

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

                    const audioData = await elevenlabsClient.speakText(text);
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
