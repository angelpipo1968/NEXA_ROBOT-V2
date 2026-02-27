import { create } from 'zustand';

export interface ProjectStats {
    words: number;
    chars: number;
    chapters: number;
    pages: number;
}

export interface ProjectData {
    id: number;
    title: string;
    content: string;
    stats: ProjectStats;
    lastSaved: Date | null;
}

interface ProjectState {
    projectData: ProjectData;
    updateProjectContent: (content: string) => void;
    updateTitle: (title: string) => void;
    saveProject: () => void;
    createNewProject: () => void;
    loadProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projectData: {
        id: Date.now(),
        title: 'Mi Novela Sin Título',
        content: '',
        stats: { words: 0, chars: 0, chapters: 1, pages: 0 },
        lastSaved: null
    },

    updateProjectContent: (content: string) => {
        const words = content.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = content.trim() === '' ? 0 : words.length;
        const charCount = content.length;
        const pageCount = Math.max(1, Math.ceil(wordCount / 300));
        const chapterCount = (content.match(/(?:cap[íi]tulo|chapter)\s+\d+/gi) || []).length + 1;

        set((state) => ({
            projectData: {
                ...state.projectData,
                content,
                stats: {
                    words: wordCount,
                    chars: charCount,
                    chapters: chapterCount,
                    pages: pageCount
                }
            }
        }));
    },

    updateTitle: (title: string) => {
        set((state) => ({
            projectData: { ...state.projectData, title }
        }));
    },

    saveProject: () => {
        set((state) => {
            const updated = {
                ...state.projectData,
                lastSaved: new Date()
            };
            if (typeof window !== 'undefined') {
                localStorage.setItem('nexa-current-project', JSON.stringify(updated));
            }
            return { projectData: updated };
        });
    },

    createNewProject: () => {
        set({
            projectData: {
                id: Date.now(),
                title: 'Mi Novela Sin Título',
                content: '',
                stats: { words: 0, chars: 0, chapters: 1, pages: 0 },
                lastSaved: null
            }
        });
    },

    loadProject: () => {
        if (typeof window !== 'undefined') {
            try {
                const savedProject = localStorage.getItem('nexa-current-project');
                if (savedProject) {
                    const parsed = JSON.parse(savedProject);
                    if (parsed.lastSaved) parsed.lastSaved = new Date(parsed.lastSaved);
                    set({ projectData: parsed });
                }
            } catch (e) {
                console.error("Error loading project from local storage", e);
            }
        }
    }
}));
