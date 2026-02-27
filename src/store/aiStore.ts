import { create } from 'zustand';
import { geminiClient } from '@/lib/gemini';
import { anthropicClient } from '@/lib/anthropic';
import { openaiClient } from '@/lib/openai';

export interface AISuggestion {
    type: 'title' | 'style' | 'idea' | 'character' | 'dialogue';
    title: string;
    content: string;
    action: string;
}

export type AIEngine = 'gemini' | 'claude' | 'gpt' | 'deepseek' | 'ollama';

export interface AIConfig {
    model: string;
    creativity: number;
    activeEngine: AIEngine;
}

interface AiState {
    aiSuggestions: AISuggestion[];
    aiConfig: AIConfig;

    generateAISuggestion: () => void;
    generateIdeas: (context: string) => Promise<string>;
    improveText: (text: string) => Promise<string>;
    continueWriting: (text: string) => Promise<string>;
    removeSuggestion: (index: number) => void;
    setActiveEngine: (engine: AIEngine) => void;
}

// Unified dispatcher
const executeAiQuery = async (prompt: string, engine: AIEngine, config: AIConfig): Promise<string> => {
    try {
        if (engine === 'claude') {
            const text = await anthropicClient.chat({ message: prompt, temperature: config.creativity });
            return text;
        } else if (engine === 'gpt') {
            const text = await openaiClient.chat({ message: prompt, temperature: config.creativity });
            return text;
        } else {
            // Default Gemini
            const response = await geminiClient.chat({ message: prompt, temperature: config.creativity });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se obtuvo respuesta.";
        }
    } catch (e) {
        console.error(`Error in executeAiQuery [${engine}]:`, e);
        return `Error de conexión con el motor IA (${engine}).`;
    }
};

export const useAiStore = create<AiState>((set, get) => ({
    aiSuggestions: [],
    aiConfig: {
        model: 'gemini-3.1-pro',
        creativity: 0.7,
        activeEngine: 'gemini'
    },

    setActiveEngine: (engine) => set((state) => ({ aiConfig: { ...state.aiConfig, activeEngine: engine } })),

    generateAISuggestion: () => {
        const suggestionsPool: AISuggestion[] = [
            {
                type: 'style',
                title: 'Estilo Rico: Potencia',
                content: 'Reemplaza "corrió muy rápido" por "sus pies devoraron el asfalto". Elimina el adverbio "muy" y usa un verbo más fuerte.',
                action: 'apply-style'
            },
            {
                type: 'idea',
                title: 'Claridad Mental',
                content: '¿Estás divagando? Para. Céntrate en EL mensaje principal que quieres dar al lector. ¿Qué se lleva de esta escena?',
                action: 'add-idea'
            },
            {
                type: 'character',
                title: 'Mostrar, No Contar',
                content: 'En lugar de decir que Juan estaba nervioso, describe cómo tamborileaba los dedos sobre la mesa de caoba.',
                action: 'add-character'
            },
            {
                type: 'dialogue',
                title: 'Diálogo con Propósito',
                content: 'Cada línea de diálogo debe avanzar la trama o revelar personaje. Si es solo relleno ("Hola, ¿qué tal?"), bórralo.',
                action: 'add-dialogue'
            }
        ];
        const randomSuggestion = suggestionsPool[Math.floor(Math.random() * suggestionsPool.length)];
        set((state) => ({ aiSuggestions: [randomSuggestion, ...state.aiSuggestions] }));
    },

    generateIdeas: async (context: string): Promise<string> => {
        try {
            console.log("Generating ideas for:", context);
            const prompt = `Actúa como un mentor de escritura enfocado en la "Claridad Mental" y el "Estilo Rico".
            El escritor está bloqueado o dando vueltas (overthinking). Tu objetivo es cortar el ruido y darle una dirección clara y potente.
            
            Contexto actual de la historia: "${context}"
            
            Dame una (1) idea concreta que:
            1.  Sea sorprendentemente simple pero profunda.
            2.  Desbloquee la trama inmediatamente.
            3.  Elimine la parálisis por análisis.
            
            Respuesta directa, sin introducciones.`;

            // Obligatorio usar Gemini para la lógica y trama de ideas (según requerimiento)
            return await executeAiQuery(prompt, 'gemini', get().aiConfig);
        } catch (error) {
            console.error("Error generating ideas:", error);
            return "Error al generar ideas. Intenta de nuevo.";
        }
    },

    improveText: async (text: string): Promise<string> => {
        try {
            console.log("Improving text:", text);
            const prompt = `Actúa como un editor literario implacable de "Estilo Rico".Transforma este texto para que sea visceral, preciso y libre de paja.
                Principios:
            1. ** Cero Adverbios(-mente) **: Elimínalos o usa verbos más fuertes.
            2. ** Economía de Palabras **: Di más con menos.
            3. ** Imágenes Sensoriales **: No digas "tenía miedo", describe el frío en el estómago.
            4. ** Ritmo **: Alterna frases cortas y largas.
            
            Texto original: "${text}"
            
            Solo devuelve la versión mejorada.`;

            // Obligatorio usar Claude para improvements de texto (según requerimiento)
            return await executeAiQuery(prompt, 'claude', get().aiConfig);
        } catch (error) {
            console.error("Error improving text:", error);
            return text;
        }
    },

    continueWriting: async (text: string): Promise<string> => {
        try {
            console.log("Continuing story:", text);
            const prompt = `Continúa la historia con "Estilo Rico". 
             Principios:
             - Vocabulario preciso y evocador.
             - Evita explicaciones innecesarias (Show, don't tell).
             - Mantén la tensión narrativa.
             
             Contexto: "...${text.slice(-1000)}"
             
             Escribe los siguientes 2 párrafos.`;

            return await executeAiQuery(prompt, get().aiConfig.activeEngine, get().aiConfig);
        } catch (error) {
            console.error("Error continuing story:", error);
            return "Error al continuar la historia.";
        }
    },

    removeSuggestion: (index: number) => {
        set((state) => ({ aiSuggestions: state.aiSuggestions.filter((_, i) => i !== index) }));
    }
}));
