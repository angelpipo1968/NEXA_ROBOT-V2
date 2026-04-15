/**
 * VoiceSynthesisEngine - Text-to-Speech synthesis wrapper
 * Uses the Web Speech API under the hood.
 */
export class VoiceSynthesisEngine {
    private synth: SpeechSynthesis | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
        }
    }

    async speak(text: string, options?: { voiceType?: string; speed?: number }): Promise<void> {
        if (!this.synth) {
            console.warn('[VoiceSynthesisEngine] SpeechSynthesis API not available.');
            return;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = options?.speed ?? 1.0;

        // Try to match a voice by type hint
        const voices = this.synth.getVoices();
        if (options?.voiceType && voices.length > 0) {
            const match = voices.find(v =>
                v.name.toLowerCase().includes(options.voiceType!.replace('-', ' '))
            );
            if (match) utterance.voice = match;
        }

        return new Promise<void>((resolve) => {
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            this.synth!.speak(utterance);
        });
    }

    stop(): void {
        this.synth?.cancel();
    }
}
