import { create } from 'zustand';

export type PanelType = 'editor' | 'biblioteca' | 'ia' | 'voz' | 'configuracion' | 'plantillas' | 'nuevo-libro' | 'personajes';

export interface UiState {
    activePanel: PanelType;
    showRightPanel: boolean;
    switchPanel: (panel: PanelType) => void;
    toggleRightPanel: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    activePanel: 'editor',
    showRightPanel: true,

    switchPanel: (panel: PanelType) => {
        set({ activePanel: panel });
    },

    toggleRightPanel: () => {
        set((state) => ({ showRightPanel: !state.showRightPanel }));
    }
}));
