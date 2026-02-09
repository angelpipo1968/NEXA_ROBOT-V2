
import * as THREE from 'three';

export class HologramAnimator {
    private mixer: THREE.AnimationMixer | null = null;

    async createAnimationSet(model: any): Promise<any> {
        // Determine if model is a THREE.Object3D or has a scene property
        const target = model.model || model;

        this.mixer = new THREE.AnimationMixer(target);

        const animations: any = {
            mixer: this.mixer
        };

        const basicAnims = ['idle', 'talk', 'listen', 'think', 'greet', 'explain', 'question', 'agree', 'disagree', 'excited'];

        for (const name of basicAnims) {
            animations[name] = this.createMockAnimation(name);
        }

        return animations;
    }

    createMockAnimation(name: string): THREE.AnimationClip {
        // Create a dummy animation clip
        const times = [0, 1];
        const values = [0, 0, 0, 0, 1, 0]; // dummy rotation
        const track = new THREE.VectorKeyframeTrack('.position', times, values);
        return new THREE.AnimationClip(name, 1, [track]);
    }
}
