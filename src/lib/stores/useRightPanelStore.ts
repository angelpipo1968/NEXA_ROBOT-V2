import { create } from 'zustand';

export type SystemStatus = 'nominal' | 'analyzing' | 'patching' | 'alert';

interface WisdomThought {
    id: string;
    text: string;
    type: 'plot' | 'character' | 'world' | 'style';
    relevance: number;
}

interface RightPanelState {
    systemStatus: SystemStatus;
    wisdomThoughts: WisdomThought[];
    lastDiagnosis: string | null;
    activeTab: 'assistant' | 'monitor' | 'publish';

    setSystemStatus: (status: SystemStatus) => void;
    addWisdom: (thought: WisdomThought) => void;
    setLastDiagnosis: (diagnosis: string | null) => void;
    setActiveTab: (tab: 'assistant' | 'monitor' | 'publish') => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
    systemStatus: 'nominal',
    wisdomThoughts: [],
    lastDiagnosis: null,
    activeTab: 'assistant',

    setSystemStatus: (status) => set({ systemStatus: status }),
    addWisdom: (thought) => set((state) => ({
        wisdomThoughts: [thought, ...state.wisdomThoughts].slice(0, 10)
    })),
    setLastDiagnosis: (diagnosis) => set({ lastDiagnosis: diagnosis }),
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
