import { create } from 'zustand';

interface ThoughtNode {
    id: string;
    label: string;
    val: number; // size
    color?: string;
    details?: string;
    timestamp: number;
}

interface ThoughtLink {
    source: string;
    target: string;
}

interface ThoughtState {
    nodes: ThoughtNode[];
    links: ThoughtLink[];
    addNode: (node: ThoughtNode, parentId?: string) => void;
    clearStream: () => void;
}

export const useThoughtStore = create<ThoughtState>((set) => ({
    nodes: [],
    links: [],
    addNode: (node, parentId) => set((state) => {
        const newNodes = [...state.nodes, node];
        const newLinks = [...state.links];
        if (parentId) {
            newLinks.push({ source: parentId, target: node.id });
        }
        return { nodes: newNodes, links: newLinks };
    }),
    clearStream: () => set({ nodes: [], links: [] }),
}));
