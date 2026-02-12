import { create } from 'zustand';
import { BookTemplate } from '../studio/BookTemplates';
import { museMemory } from '../museMemory';
import { AspectRatio, ImageQuality } from '../services/imageService';

interface Chapter {
    id: string;
    title: string;
    content: string;
}

interface GeneratedAsset {
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
    type: 'image' | 'render';
}

interface StudioState {
    // Mode
    mode: 'vision' | 'editorial';
    setMode: (mode: 'vision' | 'editorial') => void;

    // View Mode
    viewMode: 'continuous' | 'pages';
    setViewMode: (mode: 'continuous' | 'pages') => void;

    // Book State
    writingTitle: string;
    setWritingTitle: (title: string) => void;
    chapters: Chapter[];
    setChapters: (chapters: Chapter[]) => void;
    activeChapterId: string;
    setActiveChapterId: (id: string) => void;

    // Vision State
    assets: GeneratedAsset[];
    addAsset: (asset: GeneratedAsset) => void;
    selectedAsset: GeneratedAsset | null;
    setSelectedAsset: (asset: GeneratedAsset | null) => void;

    // UI State
    leftPanelWidth: number;
    setLeftPanelWidth: (width: number) => void;

    // Image Settings
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    quality: ImageQuality;
    setQuality: (quality: ImageQuality) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
    mode: 'editorial',
    setMode: (mode) => set({ mode }),

    viewMode: 'pages',
    setViewMode: (viewMode) => set({ viewMode }),

    writingTitle: museMemory.load().bookState.title || 'Sin título',
    setWritingTitle: (writingTitle) => set({ writingTitle }),

    chapters: museMemory.load().bookState.chapters.length > 0
        ? museMemory.load().bookState.chapters
        : [{ id: '1', title: 'Capítulo 1', content: '' }],
    setChapters: (chapters) => set({ chapters }),

    activeChapterId: museMemory.load().bookState.activeChapterId || '1',
    setActiveChapterId: (activeChapterId) => set({ activeChapterId }),

    assets: [],
    addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
    selectedAsset: null,
    setSelectedAsset: (selectedAsset) => set({ selectedAsset }),

    leftPanelWidth: 400,
    setLeftPanelWidth: (leftPanelWidth) => set({ leftPanelWidth }),

    // Image Settings Defaults
    aspectRatio: '1:1',
    setAspectRatio: (aspectRatio) => set({ aspectRatio }),
    quality: 'standard',
    setQuality: (quality) => set({ quality }),
}));
