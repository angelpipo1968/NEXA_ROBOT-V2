import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
    theme: Theme;
    effectiveTheme: 'light' | 'dark'; // Resolved theme after checking system preference
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

// Helper to get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper to resolve effective theme
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') return getSystemTheme();
    return theme;
};

// Helper to apply theme to document
const applyTheme = (effectiveTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);

    // Optional: update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content',
            effectiveTheme === 'dark' ? '#0a0a0a' : '#ffffff'
        );
    }
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'system',
            effectiveTheme: getSystemTheme(),

            setTheme: (theme: Theme) => {
                const effectiveTheme = resolveTheme(theme);
                applyTheme(effectiveTheme);
                set({ theme, effectiveTheme });
            },

            toggleTheme: () => {
                const current = get().effectiveTheme;
                const newTheme = current === 'dark' ? 'light' : 'dark';
                get().setTheme(newTheme);
            }
        }),
        {
            name: 'nexa-theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme on initial load
                if (state) {
                    const effectiveTheme = resolveTheme(state.theme);
                    state.effectiveTheme = effectiveTheme;
                    applyTheme(effectiveTheme);

                    // Listen for system theme changes
                    if (state.theme === 'system') {
                        window.matchMedia('(prefers-color-scheme: dark)')
                            .addEventListener('change', (e) => {
                                const newEffective = e.matches ? 'dark' : 'light';
                                state.effectiveTheme = newEffective;
                                applyTheme(newEffective);
                            });
                    }
                }
            }
        }
    )
);
