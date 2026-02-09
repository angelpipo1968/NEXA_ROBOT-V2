export const elevenlabsClient = {
    speakText: async (text: string): Promise<ArrayBuffer> => {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella (Female) - Very soft and natural

        // Use multilingual model for better Spanish support
        const modelId = 'eleven_multilingual_v2';

        if (!apiKey) {
            throw new Error('Missing ElevenLabs API Key');
        }

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: modelId,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail?.message || 'ElevenLabs API Error');
        }

        return await response.arrayBuffer();
    }
};
