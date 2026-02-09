import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
    // Search Settings
    autoSearchEnabled: boolean;
    searchCacheEnabled: boolean;

    // Toggle functions
    toggleAutoSearch: () => void;
    toggleSearchCache: () => void;

    // Cache management
    clearSearchCache: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            // Initial state
            autoSearchEnabled: true,
            searchCacheEnabled: true,

            // Actions
            toggleAutoSearch: () => set((state) => ({
                autoSearchEnabled: !state.autoSearchEnabled
            })),

            toggleSearchCache: () => set((state) => ({
                searchCacheEnabled: !state.searchCacheEnabled
            })),

            clearSearchCache: () => {
                // This will be handled by searchCache service
                console.log('[SETTINGS] Clearing search cache...');
            }
        }),
        {
            name: 'nexa-settings-storage',
            version: 1
        }
    )
);
