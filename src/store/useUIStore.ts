import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
    toggleSettings: () => void;
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
        }),
        {
            name: 'nexa-ui-storage',
        }
    )
);
