/**
 * Sistema de memoria persistente para Nexa Muse
 * Guarda el estado del estudio editorial, conversaciones y preferencias
 */

export interface MuseMemory {
    // Estado del libro
    bookState: {
        title: string;
        chapters: Array<{ id: string; title: string; content: string }>;
        activeChapterId: string;
        lastSaved: number;
    };
    
    // Conversaciones con Muse
    museConversations: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: number;
    }>;
    
    // Configuración del usuario
    preferences: {
        voiceEnabled: boolean;
        activeVibe: 'none' | 'rain' | 'fire' | 'cafe' | 'lofi' | 'nature';
        volume: number;
        museOpen: boolean;
        lastRefinementType?: 'elegance' | 'fluidity' | 'magic' | 'rewrite' | 'expand' | 'fix';
    };
    
    // Contexto de escritura
    writingContext: {
        lastEditedChapter: string;
        lastEditTime: number;
        wordCount: number;
        writingStyle?: 'creative' | 'professional' | 'technical';
    };
    
    // Historial de refinamientos
    refinementHistory: Array<{
        type: string;
        chapterId: string;
        timestamp: number;
        beforeWordCount: number;
        afterWordCount: number;
    }>;
}

const STORAGE_KEY = 'nexa_muse_memory';
const MAX_CONVERSATION_HISTORY = 50; // Máximo de mensajes en historial

export const museMemory = {
    /**
     * Guarda el estado completo en localStorage
     */
    save: (memory: Partial<MuseMemory>) => {
        try {
            const existing = museMemory.load();
            const updated: MuseMemory = {
                ...existing,
                ...memory,
                // Merge nested objects
                bookState: { ...existing.bookState, ...memory.bookState },
                preferences: { ...existing.preferences, ...memory.preferences },
                writingContext: { ...existing.writingContext, ...memory.writingContext },
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error('Error saving Muse memory:', error);
            return false;
        }
    },

    /**
     * Carga el estado desde localStorage
     */
    load: (): MuseMemory => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading Muse memory:', error);
        }
        
        // Return default state
        return {
            bookState: {
                title: '',
                chapters: [
                    { id: 'intro', title: 'Introducción', content: '' },
                    { id: '1', title: 'Capítulo 1', content: '' }
                ],
                activeChapterId: '1',
                lastSaved: Date.now()
            },
            museConversations: [],
            preferences: {
                voiceEnabled: true,
                activeVibe: 'none',
                volume: 0.5,
                museOpen: true
            },
            writingContext: {
                lastEditedChapter: '1',
                lastEditTime: Date.now(),
                wordCount: 0
            },
            refinementHistory: []
        };
    },

    /**
     * Guarda el estado del libro
     */
    saveBookState: (title: string, chapters: Array<{ id: string; title: string; content: string }>, activeChapterId: string) => {
        museMemory.save({
            bookState: {
                title,
                chapters,
                activeChapterId,
                lastSaved: Date.now()
            },
            writingContext: {
                lastEditedChapter: activeChapterId,
                lastEditTime: Date.now(),
                wordCount: chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0)
            }
        });
    },

    /**
     * Guarda una conversación con Muse
     */
    saveConversation: (role: 'user' | 'assistant', content: string) => {
        const existing = museMemory.load();
        const newMessage = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: Date.now()
        };
        
        const conversations = [...existing.museConversations, newMessage];
        // Mantener solo los últimos N mensajes
        const trimmed = conversations.slice(-MAX_CONVERSATION_HISTORY);
        
        museMemory.save({
            museConversations: trimmed
        });
    },

    /**
     * Guarda las preferencias del usuario
     */
    savePreferences: (preferences: Partial<MuseMemory['preferences']>) => {
        const existing = museMemory.load();
        museMemory.save({
            preferences: {
                ...existing.preferences,
                ...preferences
            }
        });
    },

    /**
     * Guarda un refinamiento en el historial
     */
    saveRefinement: (type: string, chapterId: string, beforeWordCount: number, afterWordCount: number) => {
        const existing = museMemory.load();
        museMemory.save({
            refinementHistory: [
                ...existing.refinementHistory.slice(-19), // Mantener últimos 20
                {
                    type,
                    chapterId,
                    timestamp: Date.now(),
                    beforeWordCount,
                    afterWordCount
                }
            ],
            preferences: {
                ...existing.preferences,
                lastRefinementType: type as any
            }
        });
    },

    /**
     * Obtiene el contexto relevante para Muse basado en el historial
     */
    getContextForMuse: (): string => {
        const memory = museMemory.load();
        const context: string[] = [];
        
        // Información del libro
        if (memory.bookState.title) {
            context.push(`Libro: "${memory.bookState.title}"`);
        }
        
        // Último capítulo editado
        const lastChapter = memory.bookState.chapters.find(c => c.id === memory.writingContext.lastEditedChapter);
        if (lastChapter) {
            context.push(`Último capítulo editado: "${lastChapter.title}"`);
        }
        
        // Último refinamiento usado
        if (memory.preferences.lastRefinementType) {
            const refinementNames: Record<string, string> = {
                elegance: 'Elegancia',
                fluidity: 'Fluidez',
                magic: 'Magia',
                rewrite: 'Reescritura',
                expand: 'Expansión',
                fix: 'Corrección'
            };
            context.push(`Último refinamiento usado: ${refinementNames[memory.preferences.lastRefinementType] || memory.preferences.lastRefinementType}`);
        }
        
        // Estadísticas
        context.push(`Palabras totales: ${memory.writingContext.wordCount}`);
        context.push(`Capítulos: ${memory.bookState.chapters.length}`);
        
        return context.join('\n');
    },

    /**
     * Limpia toda la memoria (útil para reset)
     */
    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Exporta la memoria como JSON (para backup)
     */
    export: (): string => {
        return JSON.stringify(museMemory.load(), null, 2);
    },

    /**
     * Importa memoria desde JSON (para restaurar backup)
     */
    import: (json: string): boolean => {
        try {
            const memory = JSON.parse(json);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
            return true;
        } catch (error) {
            console.error('Error importing Muse memory:', error);
            return false;
        }
    }
};
