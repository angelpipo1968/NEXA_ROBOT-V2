import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
    toggleSettings: () => void;

    // Extracted from ChatStore
    activeModule: 'chat' | 'studio' | 'dev';
    setActiveModule: (module: 'chat' | 'studio' | 'dev') => void;

    isVideoMode: boolean;
    toggleVideoMode: () => void;

    isArtifactPanelOpen: boolean;
    setArtifactPanelOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isSidebarOpen: true,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            isSettingsOpen: false,
            setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
            toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

            activeModule: 'chat',
            setActiveModule: (module) => set({ activeModule: module }),

            isVideoMode: false,
            toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode })),

            isArtifactPanelOpen: false,
            setArtifactPanelOpen: (isOpen) => set({ isArtifactPanelOpen: isOpen }),
        }),
        {
            name: 'nexa-ui-storage',
        }
    )
);
