import { geminiClient } from '../gemini';

export type AspectRatio = '1:1' | '16:9' | '9:16';
export type ImageQuality = 'draft' | 'standard' | 'ultra';

interface MediaOptions {
    aspectRatio?: AspectRatio;
    quality?: ImageQuality;
}

export const imageService = {
    /**
     * Enhances a simple prompt into a professional Flux-optimized version.
     */
    async enhancePrompt(userPrompt: string, type: 'image' | 'video' = 'image'): Promise<string> {
        try {
            const systemMsg = `You are a professional Prompt Engineer for ${type === 'image' ? 'Flux 1.1' : 'AI Video Generation'}. 
            Transform the following simple prompt into a high-fidelity, world-class artistic instruction. 
            Focus on lighting, textures, cinematic composition, and technical details. 
            Output ONLY the enhanced prompt in English.`;

            const response = await geminiClient.chat({
                message: `${systemMsg}\n\nUser prompt: "${userPrompt}"`
            });

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || userPrompt;
            return text.trim() || userPrompt;
        } catch (error) {
            console.error('[ImageService] Error enhancing prompt:', error);
            return userPrompt;
        }
    },

    /**
     * Generates a world-class image using Flux 1.1 via Pollinations.
     */
    async generateFluxImage(prompt: string, options: MediaOptions = {}): Promise<string> {
        try {
            const { aspectRatio = '1:1', quality = 'standard' } = options;

            // Define dimensions based on aspect ratio
            let width = 1024;
            let height = 1024;

            if (aspectRatio === '16:9') {
                width = 1280;
                height = 720;
            } else if (aspectRatio === '9:16') {
                width = 720;
                height = 1280;
            }

            let detailSuffix = '';
            if (quality === 'ultra') {
                detailSuffix = ', extremely detailed, 8k resolution, cinematic lighting, masterpiece';
            } else if (quality === 'draft') {
                detailSuffix = ', basic sketch, simple detail';
            }

            const finalPrompt = `${prompt}${detailSuffix}`;
            const encodedPrompt = encodeURIComponent(finalPrompt);
            const seed = Math.floor(Math.random() * 2000000);

            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true&model=flux`;

            console.log('[ImageService] World-Class Image URL:', url);
            return url;
        } catch (error) {
            console.error('[ImageService] Error generating Flux image:', error);
            throw error;
        }
    },

    /**
     * Generates a video (Simulated/Placeholder)
     */
    async generateVideo(prompt: string, options: MediaOptions = {}): Promise<string> {
        try {
            console.log('[ImageService] Generating video for prompt:', prompt);
            const seed = Math.floor(Math.random() * 100);
            const loops = [
                'https://assets.mixkit.co/videos/preview/mixkit-abstract-movement-of-fluid-shapes-in-blue-and-purple-40011-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-outer-space-with-billions-of-stars-40010-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-40008-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-orange-paint-swirls-in-water-40012-large.mp4'
            ];
            return loops[seed % loops.length];
        } catch (error) {
            console.error('[ImageService] Error generating video:', error);
            throw error;
        }
    }
};
