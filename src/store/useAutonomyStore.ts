import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelfCorrectionRule {
    id: string;
    lesson: string;
    rule: string;
    timestamp: number;
    active: boolean;
}

interface AutonomyState {
    selfCorrectionRules: SelfCorrectionRule[];
    lastHeartbeat: number | null;
    isReflecting: boolean;

    // Actions
    addRule: (lesson: string, rule: string) => void;
    toggleRule: (id: string) => void;
    deleteRule: (id: string) => void;
    setLastHeartbeat: (timestamp: number) => void;
    setReflecting: (isReflecting: boolean) => void;
    getSystemRulesPrompt: () => string;
}

export const useAutonomyStore = create<AutonomyState>()(
    persist(
        (set, get) => ({
            selfCorrectionRules: [],
            lastHeartbeat: null,
            isReflecting: false,

            addRule: (lesson, rule) => set((state) => ({
                selfCorrectionRules: [
                    ...state.selfCorrectionRules.slice(-10), // Keep last 10 rules to avoid prompt bloat
                    {
                        id: crypto.randomUUID(),
                        lesson,
                        rule,
                        timestamp: Date.now(),
                        active: true
                    }
                ]
            })),

            toggleRule: (id) => set((state) => ({
                selfCorrectionRules: state.selfCorrectionRules.map(r => 
                    r.id === id ? { ...r, active: !r.active } : r
                )
            })),

            deleteRule: (id) => set((state) => ({
                selfCorrectionRules: state.selfCorrectionRules.filter(r => r.id !== id)
            })),

            setLastHeartbeat: (timestamp) => set({ lastHeartbeat: timestamp }),
            
            setReflecting: (isReflecting) => set({ isReflecting }),

            getSystemRulesPrompt: () => {
                const activeRules = get().selfCorrectionRules.filter(r => r.active);
                if (activeRules.length === 0) return '';

                return `\n\n[PROTOCOLOS DE AUTO-MEJORA (SINGULARITY UPDATE)]:
${activeRules.map((r, i) => `${i + 1}. REGLA: ${r.rule}`).join('\n')}`;
            }
        }),
        {
            name: 'nexa-autonomy-storage',
        }
    )
);
