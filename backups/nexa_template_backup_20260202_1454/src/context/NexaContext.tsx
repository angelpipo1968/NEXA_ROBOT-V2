"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
    const generateAISuggestion = () => {
        const suggestionsPool: AISuggestion[] = [
            {
                type: 'title',
                title: 'Título Sugerido',
                content: `"El Susurro de las Máquinas Silenciosas"`,
                action: 'use-title'
            },
            {
                type: 'style',
                title: 'Mejora Estilística',
                content: 'Reemplaza "corrió rápido" con "sus pies devoraron el asfalto mientras el corazón martilleaba contra sus costillas"',
                action: 'apply-style'
            },
            {
                type: 'idea',
                title: 'Giro Argumental',
                content: 'El aliado más leal es en realidad el antagonista disfrazado desde el capítulo 3',
                action: 'add-idea'
            },
            {
                type: 'character',
                title: 'Profundidad de Personaje',
                content: 'Añade una fobia específica (ej: miedo a los relojes de péndulo) que revele trauma infantil',
                action: 'add-character'
            },
            {
                type: 'dialogue',
                title: 'Diálogo Auténtico',
                content: 'El personaje secundario revela su motivación oculta mediante una metáfora sobre jardinería',
                action: 'add-dialogue'
            }
        ];

        const randomSuggestion = suggestionsPool[Math.floor(Math.random() * suggestionsPool.length)];
        setAiSuggestions(prev => [randomSuggestion, ...prev]);
    };

    const removeSuggestion = (index: number) => {
        setAiSuggestions(prev => prev.filter((_, i) => i !== index));
    };

    // Templates Logic
    const applyTemplate = (templateKey: string) => {
        const templates: Record<string, string> = {
            novel: `# [Título de la Novela]\n\n## Capítulo 1\n\nEl viento susurraba secretos entre los árboles mientras [Nombre del Protagonista] caminaba por el sendero olvidado...`,
            thriller: `# [Título Impactante]\n\n## Capítulo 1: 23:47\n\nEl teléfono vibró sobre la mesa de madera...`,
            fantasy: `# [Título Épico]\n\n## Prólogo: La Caída del Primer Hechicero\n\nEn los días en que los dioses caminaban entre los mortales...`,
            scifi: `# [Título Conceptual]\n\n## Año 2187 — Estación Orbital Kepler-186f\n\nEl silencio en la sala de control era más ensordecedor...`,
            romance: `# [Título Emocional]\n\n## Capítulo 1: El Café de la Esquina\n\nEl aroma a canela y café recién hecho era lo único constante...`,
            memoir: `# [Título Personal]\n\n## Prólogo: Las Huellas que Dejamos\n\nMi abuela decía que las casas no guardan recuerdos...`,
            poetry: `# [Título Poético]\n\n## I. Raíces\n\nBajo la tierra oscura,\nlas raíces no preguntan por el sol...`,
            nonfiction: `# [Título Persuasivo]\n\n## Introducción: El Problema Invisible\n\nEn 2023, el 78% de los profesionales experimentaron agotamiento...`,
            children: `# [Título Infantil]\n\n## Capítulo 1: El Día que las Estrellas Bajaron a Jugar\n\nLuna era una niña de siete años...`,
            short: `# [Título de Colección]\n\n## Relato 1: El Último Mensaje\n\nEl teléfono vibró a las 3:07 AM...`
        };

        if (templates[templateKey]) {
            updateProjectContent(templates[templateKey]);
            updateTitle(`Nuevo Libro - ${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)}`);
        }
    };

    // Voice Logic
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
        utterance.rate = voiceConfig.speed;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

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
