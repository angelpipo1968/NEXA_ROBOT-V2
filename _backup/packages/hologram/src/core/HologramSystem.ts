import { SimpleHologram } from './SimpleHologram';
import { HologramGenerator } from '../generators/HologramGenerator';
import { HologramAnimator } from '../animators/HologramAnimator';
import { VoiceHologramSync } from '../sync/VoiceHologramSync';
import { HologramInteractor } from '../interaction/HologramInteractor';

export interface HologramCharacter {
    name: string;
    type: string;
    personality: string;
    appearance: any;
}

export interface HologramEnvironment {
    type: string;
    lighting: string;
    effects: string[];
}

export class HologramSystem {
    private hologram: SimpleHologram | null = null;
    private generator: HologramGenerator;
    private animator: HologramAnimator;
    private interactor: HologramInteractor;
    private voiceSync: VoiceHologramSync;

    constructor() {
        this.generator = new HologramGenerator();
        this.animator = new HologramAnimator();
        this.interactor = new HologramInteractor();
        this.voiceSync = new VoiceHologramSync();
    }

    public attach(canvas: HTMLCanvasElement) {
        this.hologram = new SimpleHologram(canvas);
        console.log('Hologram attached to canvas');
    }

    public getHologram(): SimpleHologram | null {
        return this.hologram;
    }

    async initialize(
        character: HologramCharacter,
        environment: HologramEnvironment
    ) {
        // In a real implementation, this would load models and apply environment settings
        // For now, we just ensure the hologram is running
        if (this.hologram && !this.hologram.isWorking()) {
            throw new Error('Hologram system attached but not working');
        }

        // Initialize voice sync
        await this.voiceSync.createVoiceLink();

        console.log('Hologram system initialized for', character.name);
    }

    public setEmotion(emotion: string) {
        if (this.hologram) {
            this.hologram.setEmotion(emotion);
        }
    }

    public setShape(shape: 'sphere' | 'cube' | 'torus' | 'pyramid') {
        if (this.hologram) {
            this.hologram.setShape(shape);
        }
    }

    public setColor(color: string | number) {
        if (this.hologram) {
            this.hologram.setColor(color);
        }
    }

    public async speak(text: string) {
        console.log(`Hologram speaking: ${text}`);

        // Simulating speech animation with pulses
        if (this.hologram) {
            this.hologram.setEmotion('happy');
            let pulses = 0;
            const interval = setInterval(() => {
                if (this.hologram) {
                    this.hologram.pulse(Math.random());
                }
                pulses++;
                if (pulses > 10) {
                    clearInterval(interval);
                    if (this.hologram) this.hologram.setEmotion('neutral');
                }
            }, 100);
        }
    }

    public playAnimation(name: string) {
        console.log(`Playing animation: ${name}`);
        // In a real implementation, this would trigger model animations
        if (this.hologram) {
            this.hologram.pulse(2.0); // Big pulse for animation for now
        }
    }

    // Compat method for existing code if needed
    async createInteractiveHologram(
        character: HologramCharacter,
        environment: HologramEnvironment
    ) {
        await this.initialize(character, environment);
        return {
            playAnimation: (name: string) => console.log('Playing animation', name),
            speak: (text: string) => this.speak(text),
            model: null
        };
    }
}
