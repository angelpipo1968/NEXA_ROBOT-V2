import { create } from 'zustand';

export interface VoiceConfig {
    enabled: boolean;
    volume: number;
    speed: number;
}

export interface VoiceState {
    isListening: boolean;
    isSpeaking: boolean;
    voiceConfig: VoiceConfig;
    speechRecognitionInst: any;
    synthesisInst: SpeechSynthesis | null;

    updateVoiceConfig: (config: Partial<VoiceConfig>) => void;
    toggleListening: () => void;
    speakText: (text: string) => void;
    initVoiceApi: (onTextHeard: (text: string) => void) => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
    isListening: false,
    isSpeaking: false,
    speechRecognitionInst: null,
    synthesisInst: null,

    voiceConfig: {
        enabled: true,
        volume: 1,
        speed: 1
    },

    updateVoiceConfig: (config) => {
        set((state) => ({ voiceConfig: { ...state.voiceConfig, ...config } }));
    },

    initVoiceApi: (onTextHeard: (text: string) => void) => {
        if (typeof window !== 'undefined') {
            const state = get();

            // Try init TTS
            if (!state.synthesisInst && 'speechSynthesis' in window) {
                set({ synthesisInst: window.speechSynthesis });
            }

            // Try init STT
            if (!state.speechRecognitionInst && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                const rec = new SpeechRecognition();
                rec.continuous = true;
                rec.interimResults = true;
                rec.lang = 'es-ES';

                rec.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0].transcript)
                        .join('');

                    if (event.results[event.results.length - 1].isFinal) {
                        onTextHeard(transcript);
                    }
                };

                rec.onend = () => set({ isListening: false });

                set({ speechRecognitionInst: rec });
            }
        }
    },

    toggleListening: () => {
        const state = get();
        if (!state.speechRecognitionInst) return;

        if (state.isListening) {
            state.speechRecognitionInst.stop();
            set({ isListening: false });
        } else {
            state.speechRecognitionInst.start();
            set({ isListening: true });
        }
    },

    speakText: (text: string) => {
        const state = get();
        if (!state.synthesisInst || !text.trim()) return;

        if (typeof SpeechSynthesisUtterance === 'undefined') {
            console.warn('SpeechSynthesisUtterance is not defined');
            return;
        }

        state.synthesisInst.cancel();

        // Sanitizar el texto para que la IA no pronuncie los símbolos ni puntuaciones ("coma", "punto", "estrella", "diagonal")
        const cleanText = text
            .replace(/[*_#~`\/\\()\[\]{}<>|]/g, ' ') // símbolos markdown (estrella, diagonal, etc)
            .replace(/[,\.;:]/g, ' ') // puntuación (coma, punto, etc) que el TTS podría leer en voz alta
            .replace(/\s+/g, ' ') // quitar espacios dobles
            .substring(0, 5000);

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-ES';
        utterance.volume = state.voiceConfig.volume;
        utterance.rate = state.voiceConfig.speed;
        utterance.onstart = () => set({ isSpeaking: true });
        utterance.onend = () => set({ isSpeaking: false });

        state.synthesisInst.speak(utterance);
    }
}));
