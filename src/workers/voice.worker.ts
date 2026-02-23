// src/workers/voice.worker.ts
// Offloads ElevenLabs TTS fetching and array buffer extraction from the main thread
self.onmessage = async (e: MessageEvent) => {
    const { text, apiKey, voiceId, modelId } = e.data;
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: modelId || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail?.message || 'ElevenLabs API Error inside generic TTS worker');
        }

        const arrayBuffer = await response.arrayBuffer();

        // Pass ArrayBuffer back to main thread
        postMessage({ type: 'SUCCESS', arrayBuffer });
    } catch (error: any) {
        self.postMessage({ type: 'ERROR', error: error.message });
    }
};
