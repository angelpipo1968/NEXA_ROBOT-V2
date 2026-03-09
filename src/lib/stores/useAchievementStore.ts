import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: number;
    requirement: number;
    category: 'minutes' | 'tools' | 'streak';
}

interface AchievementState {
    achievements: Achievement[];
    currentToolCalls: number;
    unlockAchievement: (id: string) => void;
    incrementToolCalls: () => void;
    resetToolCalls: () => void;
    unlockAllAchievements: () => void;
    checkAchievements: (value: number, category: 'minutes' | 'tools') => void;
    announceCallback: ((name: string) => void) | null;
    setAnnounceCallback: (cb: (name: string) => void) => void;
}

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            achievements: [
                { id: 'zen', name: 'Zen Voyager', description: 'Maintain 30 mins of Deep Flow.', icon: '🌊', requirement: 30, category: 'minutes' },
                { id: 'architect', name: 'Neural Architect', description: '1 Hour of uninterrupted creation.', icon: '🏛️', requirement: 60, category: 'minutes' },
                { id: 'singularity', name: 'Singularity Flow', description: '2 Hours of God-mode productivity.', icon: '⚛️', requirement: 120, category: 'minutes' },
                { id: 'guardian', name: 'Guardian Blessed', description: 'Zero distractions for 45 mins.', icon: '🛡️', requirement: 45, category: 'minutes' },
                { id: 'architect-singularity', name: 'Architect of the Singularity', description: 'Chain 5+ tool autonomous reasoning flow.', icon: '🌌', requirement: 5, category: 'tools' }
            ],
            currentToolCalls: 0,
            announceCallback: null,
            setAnnounceCallback: (cb) => set({ announceCallback: cb }),
            unlockAchievement: (id) => {
                const { achievements, announceCallback } = get();
                const achievement = achievements.find(a => a.id === id);
                if (achievement && !achievement.unlockedAt) {
                    const updated = achievements.map(a =>
                        a.id === id ? { ...a, unlockedAt: Date.now() } : a
                    );
                    set({ achievements: updated });
                    if (announceCallback) announceCallback(achievement.name);
                }
            },
            incrementToolCalls: () => {
                const newVal = get().currentToolCalls + 1;
                set({ currentToolCalls: newVal });
                get().checkAchievements(newVal, 'tools');
            },
            resetToolCalls: () => set({ currentToolCalls: 0 }),
            unlockAllAchievements: () => {
                const { achievements, announceCallback } = get();
                const updated = achievements.map(a => ({ ...a, unlockedAt: Date.now() }));
                set({ achievements: updated });
                if (announceCallback) announceCallback("Architect of the Nexus");
            },
            checkAchievements: (value, category) => {
                const { achievements, unlockAchievement } = get();
                achievements.forEach(a => {
                    if (a.category === category && !a.unlockedAt && value >= a.requirement) {
                        unlockAchievement(a.id);
                    }
                });
            }
        }),
        {
            name: 'nexa-achievements-storage',
            partialize: (state) => ({ achievements: state.achievements })
        }
    )
);
