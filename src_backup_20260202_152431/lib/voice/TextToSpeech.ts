export interface VoiceOptions {
    speed?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (event: SpeechSynthesisErrorEvent) => void;
}

export interface VoiceInfo {
    name: string;
    lang: string;
    localService: boolean;
    default: boolean;
}

export class NexaVoice {
    private synth!: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private isSpeaking = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
            this.loadVoices();
        }
    }

    async loadVoices() {
        if (!this.synth) return;
        // Esperar a que las voces estén cargadas
        return new Promise<void>((resolve) => {
            const load = () => {
                this.voices = this.synth.getVoices();
                if (this.voices.length > 0) {
                    resolve();
                }
            };

            load();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = load;
            }
        });
    }

    speak(text: string, options: VoiceOptions = {}) {
        if (!this.synth) return;

        if (this.isSpeaking) {
            this.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Configurar opciones
        utterance.rate = options.speed || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Seleccionar voz (prioridad: voz seleccionada -> español femenino -> español -> femenino -> primera)
        let targetVoice = this.voices.find(v => v.name === options.voiceName);

        if (!targetVoice) {
            targetVoice = this.voices.find(v =>
                v.lang.startsWith('es') && v.name.includes('Female')
            ) || this.voices.find(v => v.lang.startsWith('es'))
                || this.voices.find(v => v.name.includes('Female'))
                || this.voices[0];
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        // Eventos
        utterance.onstart = () => {
            this.isSpeaking = true;
            options.onStart?.();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            options.onEnd?.();
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            if (event.error === 'interrupted') {
                return;
            }
            console.error('Error TTS:', event.error);
            options.onError?.(event);
        };

        this.synth.speak(utterance);
    }

    stop() {
        if (!this.synth) return;
        this.synth.cancel();
        this.isSpeaking = false;
    }

    pause() {
        if (!this.synth) return;
        this.synth.pause();
    }

    resume() {
        if (!this.synth) return;
        this.synth.resume();
    }

    getAvailableVoices(): VoiceInfo[] {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
            default: voice.default
        }));
    }

    isSupported(): boolean {
        return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }
}
