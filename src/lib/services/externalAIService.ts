/**
 * NEXA EXTERNAL AI SERVICE
 * Conecta con el "Cortex de 16GB" en Hugging Face Spaces.
 */

const HF_BASE_URL = "https://angelpipo1968-nexa-brain-v3.hf.space";

export interface ExternalAIResponse {
    result: string;
    tokens?: number;
    processed_by: string;
}

export const externalAIService = {
    /**
     * Envía una tarea pesada al servidor externo.
     */
    processTask: async (prompt: string, type: 'GENERIC' | 'VISION' | 'HEAVY_ANALYSIS' = 'GENERIC'): Promise<ExternalAIResponse | null> => {
        try {
            console.log(`[ExternalAI] 🧠 Enviando tarea de tipo ${type} al Cortex Externo...`);
            
            const response = await fetch(`${HF_BASE_URL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, type }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[ExternalAI] ✅ Respuesta recibida de ${data.processed_by}`);
            return data;
        } catch (error) {
            console.error('[ExternalAI] Error en la conexión externa:', error);
            return null;
        }
    },

    /**
     * Envía una imagen (base64) para análisis visual.
     */
    processVision: async (base64Image: string): Promise<ExternalAIResponse | null> => {
        try {
            console.log(`[ExternalAI] 👁️ Iniciando análisis de visión en Cortex 16GB...`);
            
            const response = await fetch(`${HF_BASE_URL}/vision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[ExternalAI] Error en visión externa:', error);
            return null;
        }
    }
};
