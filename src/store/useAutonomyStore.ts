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
    status: 'idle' | 'reflecting' | 'researching' | 'sleeping';
    currentTask: string | null;
    logs: string[];
    metrics: {
        lastLatency: number;
        avgLatency: number;
        tokenUsage: number;
        provider: string;
    };
    performanceLog: Array<{ timestamp: number; latency: number; provider: string }>;

    // Actions
    addRule: (lesson: string, rule: string) => void;
    toggleRule: (id: string) => void;
    deleteRule: (id: string) => void;
    setLastHeartbeat: (timestamp: number) => void;
    setStatus: (status: AutonomyState['status'], task?: string) => void;
    addLog: (log: string) => void;
    updateMetrics: (latency: number, provider: string) => void;
    getSystemRulesPrompt: () => string;
}

export const useAutonomyStore = create<AutonomyState>()(
    persist(
        (set, get) => ({
            selfCorrectionRules: [],
            lastHeartbeat: null,
            isReflecting: false,
            status: 'idle',
            currentTask: null,
            logs: [],
            metrics: {
                lastLatency: 0,
                avgLatency: 0,
                tokenUsage: 0,
                provider: 'gemini'
            },
            performanceLog: [],

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
            
            setStatus: (status, task) => set({ 
                status, 
                currentTask: task || null,
                isReflecting: status === 'reflecting'
            }),

            addLog: (log) => set((state) => ({
                logs: [log, ...state.logs].slice(0, 20)
            })),

            updateMetrics: (latency, provider) => set((state) => {
                const newLog = [
                    { timestamp: Date.now(), latency, provider },
                    ...state.performanceLog
                ].slice(0, 50);
                
                const avg = newLog.reduce((acc, curr) => acc + curr.latency, 0) / newLog.length;

                return {
                    metrics: {
                        ...state.metrics,
                        lastLatency: latency,
                        avgLatency: avg,
                        provider
                    },
                    performanceLog: newLog
                };
            }),

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
