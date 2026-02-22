export interface VoiceOptions {
    voiceType?: string;
    emotion?: string;
    speed?: number;
}

export interface VoiceResult {
    audioStream?: ReadableStream;
    variations?: any[];
    voice: string;
    duration: number;
    format: string;
    sampleRate: number;
}

export interface ReadAloudOptions extends VoiceOptions {

}

export class VoiceSynthesisEngine {
    private voices = {
        humanMale: {
            id: 'human-male-01',
            type: 'human',
            language: 'es-ES',
            emotionRange: ['neutral', 'happy', 'serious', 'excited'],
            speedRange: [0.5, 2.0]
        },
        humanFemale: {
            id: 'human-female-01',
            type: 'human',
            language: 'es-ES',
            emotionRange: ['neutral', 'warm', 'professional', 'friendly'],
            speedRange: [0.5, 2.0]
        },
        aiNeutral: {
            id: 'ai-neutral',
            type: 'ai',
            language: 'multi',
            features: ['crystal-clear', 'consistent', 'professional']
        },
        storyteller: {
            id: 'storyteller',
            type: 'hybrid',
            language: 'es-ES',
            features: ['dramatic', 'expressive', 'emotional']
        }
    };

    private selectVoice(options: VoiceOptions) {
        // Logic to select best voice
        return this.voices.humanFemale; // Default
    }



    private synth: SpeechSynthesis | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
        }
    }

    async speak(text: string, options: VoiceOptions = {}): Promise<void> {
        if (!this.synth) {
            console.warn("SpeechSynthesis not available");
            return;
        }

        // Cancel previous speech
        // Cancel previous speech
        this.synth.cancel();

        if (typeof SpeechSynthesisUtterance === 'undefined') {
            console.warn('SpeechSynthesisUtterance is not defined');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Map options
        if (options.speed) utterance.rate = options.speed;

        // Simple voice selection fallback
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('es'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => console.log("Started speaking");
        utterance.onend = () => console.log("Finished speaking");

        this.synth.speak(utterance);
    }

    async synthesize(
        text: string,
        options: VoiceOptions
    ): Promise<VoiceResult> {
        // If client-side and requested, we can use browser TTS or just return mock stream for specific formats
        // For now, we keep the mock stream but allow 'speak' to be called separately

        const voice = this.selectVoice(options);
        console.log(`Synthesizing voice: ${voice.id} [${options.emotion || 'neutral'}]`);

        // Generación en streaming para respuesta inmediata (Simulated)
        const stream = new ReadableStream({
            async start(controller) {
                controller.enqueue(new Uint8Array([0, 1, 2, 3]));
                console.log('🎤 Primer chunk de audio generado');
                controller.close();
            }
        });

        return {
            audioStream: stream,
            variations: [],
            voice: voice.id,
            duration: text.length * 0.1,
            format: 'mp3',
            sampleRate: 44100
        };
    }

    async readAloudWithHighlighting(
        text: string,
        elementId: string,
        options: ReadAloudOptions
    ): Promise<any> {
        // Trigger actual speech
        await this.speak(text, options);

        const words = text.split(/\s+/);
        // ... (rest of logic handles visual syncing mock)

        const syncData = words.map((word, index) => ({
            word,
            startTime: index * 300,
            duration: 300,
            emphasis: false
        }));

        return {
            audio: null, // Audio handled by browser API
            syncData,
            elementId,
            controls: { play: true, pause: true },
            highlights: { enabled: true }
        };
    }
}
