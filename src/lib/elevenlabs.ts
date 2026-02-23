// src/lib/elevenlabs.ts - Offloads to Web Worker
export const elevenlabsClient = {
    speakText: async (text: string, voiceIdOverride?: string): Promise<ArrayBuffer> => {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella (Female)
        const voiceId = voiceIdOverride || defaultVoiceId;
        const modelId = 'eleven_multilingual_v2';

        if (!apiKey) {
            throw new Error('Missing ElevenLabs API Key');
        }

        return new Promise((resolve, reject) => {
            // Instantiate worker
            const worker = new Worker(new URL('../workers/voice.worker.ts', import.meta.url), { type: 'module' });

            worker.onmessage = (e) => {
                if (e.data.type === 'SUCCESS') {
                    resolve(e.data.arrayBuffer);
                } else {
                    reject(new Error(e.data.error || 'Worker processed error'));
                }
                worker.terminate();
            };

            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };

            // Post message to worker with transferable array buffers handling (no buffers to send though)
            worker.postMessage({
                text,
                apiKey,
                voiceId,
                modelId
            });
        });
    }
};
