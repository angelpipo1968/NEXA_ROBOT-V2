"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { geminiClient } from '@/lib/gemini';

type PanelType = 'editor' | 'biblioteca' | 'ia' | 'voz' | 'configuracion' | 'plantillas' | 'nuevo-libro';

interface ProjectStats {
    words: number;
    chars: number;
    chapters: number;
    pages: number;
}

interface ProjectData {
    id: number;
    title: string;
    content: string;
    stats: ProjectStats;
    lastSaved: Date | null;
}

export interface AISuggestion {
    type: 'title' | 'style' | 'idea' | 'character' | 'dialogue';
    title: string;
    content: string;
    action: string;
}

interface VoiceConfig {
    enabled: boolean;
    volume: number;
    speed: number;
}

interface AIConfig {
    model: string;
    creativity: number;
}

interface NexaContextType {
    activePanel: PanelType;
    switchPanel: (panel: PanelType) => void;

    projectData: ProjectData;
    updateProjectContent: (content: string) => void;
    updateTitle: (title: string) => void;
    saveProject: () => void;
    createNewProject: () => void;

    // AI
    aiSuggestions: AISuggestion[];
    generateAISuggestion: () => void;
    generateIdeas: (context: string) => Promise<string>;
    improveText: (text: string) => Promise<string>;
    continueWriting: (text: string) => Promise<string>;
    removeSuggestion: (index: number) => void;
    aiConfig: AIConfig;

    // Templates
    applyTemplate: (templateKey: string) => void;

    // Voice
    voiceActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    toggleListening: () => void;
    speakText: (text: string) => void;
    voiceConfig: VoiceConfig;
    updateVoiceConfig: (config: Partial<VoiceConfig>) => void;

    // UI
    showRightPanel: boolean;
    toggleRightPanel: () => void;
}

const NexaContext = createContext<NexaContextType | undefined>(undefined);

export function NexaProvider({ children }: { children: React.ReactNode }) {
    const [activePanel, setActivePanel] = useState<PanelType>('editor');
    const [showRightPanel, setShowRightPanel] = useState(true);

    const [projectData, setProjectData] = useState<ProjectData>({
        id: Date.now(),
        title: 'Mi Novela Sin Título',
        content: '',
        stats: { words: 0, chars: 0, chapters: 1, pages: 0 },
        lastSaved: null
    });

    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

    // Config State
    const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
        enabled: true,
        volume: 1,
        speed: 1
    });

    const [aiConfig, setAiConfig] = useState<AIConfig>({
        model: 'gemini-pro',
        creativity: 0.7
    });

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechRecognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedProject = localStorage.getItem('nexa-current-project');
                if (savedProject) {
                    const parsed = JSON.parse(savedProject);
                    if (parsed.lastSaved) parsed.lastSaved = new Date(parsed.lastSaved);
                    setProjectData(parsed);
                }

                // Init Voice API
                if ('speechSynthesis' in window) {
                    synthesisRef.current = window.speechSynthesis;
                }

                if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    speechRecognitionRef.current = new SpeechRecognition();
                    speechRecognitionRef.current.continuous = true;
                    speechRecognitionRef.current.interimResults = true;
                    speechRecognitionRef.current.lang = 'es-ES';

                    speechRecognitionRef.current.onresult = (event: any) => {
                        const transcript = Array.from(event.results)
                            .map((result: any) => result[0].transcript)
                            .join('');

                        if (event.results[event.results.length - 1].isFinal) {
                            updateProjectContent(projectData.content + ' ' + transcript);
                        }
                    };

                    speechRecognitionRef.current.onend = () => setIsListening(false);
                }
            } catch (e) {
                console.error("Error initializing context", e);
            }
        }
    }, [projectData.content]);

    const switchPanel = (panel: PanelType) => {
        setActivePanel(panel);
    };

    const toggleRightPanel = () => {
        setShowRightPanel(prev => !prev);
    };

    const updateProjectContent = (content: string) => {
        const words = content.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = content.trim() === '' ? 0 : words.length;
        const charCount = content.length;
        const pageCount = Math.max(1, Math.ceil(wordCount / 300));
        // Simple chapter count regex
        const chapterCount = (content.match(/(?:cap[íi]tulo|chapter)\s+\d+/gi) || []).length + 1;

        setProjectData(prev => ({
            ...prev,
            content,
            stats: {
                words: wordCount,
                chars: charCount,
                chapters: chapterCount,
                pages: pageCount
            }
        }));
    };

    const updateTitle = (title: string) => {
        setProjectData(prev => ({ ...prev, title }));
    };

    const saveProject = () => {
        const updated = {
            ...projectData,
            lastSaved: new Date()
        };
        setProjectData(updated);
        localStorage.setItem('nexa-current-project', JSON.stringify(updated));
    };

    const createNewProject = () => {
        setProjectData({
            id: Date.now(),
            title: 'Mi Novela Sin Título',
            content: '',
            stats: { words: 0, chars: 0, chapters: 1, pages: 0 },
            lastSaved: null
        });
        setAiSuggestions([]);
    };

    // AI Logic
    // AI Logic
    // AI Logic
    const generateAISuggestion = () => {
        // ... existing logic ...
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
        setAiSuggestions(prev => [randomSuggestion, ...prev]);
    };

    const generateIdeas = async (context: string): Promise<string> => {
        try {
            console.log("Generating ideas for:", context);
            // Prompt inspirada en "Claridad Mental" y superar el "Overthinking"
            const prompt = `Actúa como un mentor de escritura enfocado en la "Claridad Mental" y el "Estilo Rico".
            
            El escritor está bloqueado o dando vueltas (overthinking). Tu objetivo es cortar el ruido y darle una dirección clara y potente.
            
            Contexto actual de la historia: "${context}"
            
            Dame una (1) idea concreta que:
            1.  Sea sorprendentemente simple pero profunda.
            2.  Desbloquee la trama inmediatamente.
            3.  Elimine la parálisis por análisis.
            
            Respuesta directa, sin introducciones.`;

            const response = await geminiClient.chat({
                message: prompt
            });

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una idea clara.";
        } catch (error) {
            console.error("Error generating ideas:", error);
            return "Error al generar ideas. Intenta de nuevo.";
        }
    };

    const improveText = async (text: string): Promise<string> => {
        try {
            console.log("Improving text:", text);
            const prompt = `Actúa como un editor literario implacable de "Estilo Rico". Transforma este texto para que sea visceral, preciso y libre de paja.
            
            Principios:
            1.  **Cero Adverbios (-mente)**: Elimínalos o usa verbos más fuertes.
            2.  **Economía de Palabras**: Di más con menos.
            3.  **Imágenes Sensoriales**: No digas "tenía miedo", describe el frío en el estómago.
            4.  **Ritmo**: Alterna frases cortas y largas.
            
            Texto original: "${text}"
            
            Solo devuelve la versión mejorada.`;

            const response = await geminiClient.chat({
                message: prompt
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
        } catch (error) {
            console.error("Error improving text:", error);
            return text;
        }
    };

    const continueWriting = async (text: string): Promise<string> => {
        try {
            console.log("Continuing story:", text);
            const prompt = `Continúa la historia con "Estilo Rico". 
             
             Principios:
             - Vocabulario preciso y evocador.
             - Evita explicaciones innecesarias (Show, don't tell).
             - Mantén la tensión narrativa.
             
             Contexto: "...${text.slice(-1000)}"
             
             Escribe los siguientes 2 párrafos.`;

            const response = await geminiClient.chat({
                message: prompt
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo continuar la historia.";
        } catch (error) {
            console.error("Error continuing story:", error);
            return "Error al continuar la historia.";
        }
    };

    const removeSuggestion = (index: number) => {
        setAiSuggestions(prev => prev.filter((_, i) => i !== index));
    };

    // Templates & Voice Logic (keeping existing)
    const applyTemplate = (templateKey: string) => {
        // ... template logic ...
    };

    const toggleListening = () => {
        if (!speechRecognitionRef.current) return;
        if (isListening) {
            speechRecognitionRef.current.stop();
            setIsListening(false);
        } else {
            speechRecognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speakText = (text: string) => {
        if (!synthesisRef.current || !text.trim()) return;
        synthesisRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text.substring(0, 5000));
        utterance.lang = 'es-ES';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        synthesisRef.current.speak(utterance);
    };

    const updateVoiceConfig = (config: Partial<VoiceConfig>) => {
        setVoiceConfig(prev => ({ ...prev, ...config }));
    };

    return (
        <NexaContext.Provider value={{
            activePanel,
            switchPanel,
            projectData,
            updateProjectContent,
            updateTitle,
            saveProject,
            createNewProject,
            aiSuggestions,
            generateAISuggestion,
            generateIdeas,
            improveText,
            continueWriting,
            removeSuggestion,
            aiConfig,
            applyTemplate,
            voiceActive: !!speechRecognitionRef.current,
            isListening,
            isSpeaking,
            toggleListening,
            speakText,
            voiceConfig,
            updateVoiceConfig,
            showRightPanel,
            toggleRightPanel
        }}>
            {children}
        </NexaContext.Provider>
    );
}

export const useNexa = () => {
    const context = useContext(NexaContext);
    if (context === undefined) {
        throw new Error('useNexa must be used within a NexaProvider');
    }
    return context;
};
