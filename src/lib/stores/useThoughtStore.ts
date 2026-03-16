import { create } from 'zustand';
import { syncService } from '@/lib/services/syncService';

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

export const useThoughtStore = create<ThoughtState>((set) => {
    // Escuchar eventos remotos de Yjs (opcional para recibir sincronización en tiempo real)
    const sharedNodes = syncService.getSharedArray('thought-nodes');
    const sharedLinks = syncService.getSharedArray('thought-links');

    sharedNodes.observe((event) => {
        if (!event.transaction.local) {
            set({ nodes: sharedNodes.toArray() });
        }
    });

    sharedLinks.observe((event) => {
        if (!event.transaction.local) {
            set({ links: sharedLinks.toArray() });
        }
    });

    return {
        nodes: sharedNodes.toArray() || [],
        links: sharedLinks.toArray() || [],
        addNode: (node, parentId) => {
            // Push to CRDT
            sharedNodes.push([node]);
            if (parentId) {
                sharedLinks.push([{ source: parentId, target: node.id }]);
            }

            // Local state update
            set((state) => {
                const newNodes = [...state.nodes, node];
                const newLinks = [...state.links];
                if (parentId) {
                    newLinks.push({ source: parentId, target: node.id });
                }
                return { nodes: newNodes, links: newLinks };
            });
        },
        clearStream: () => {
            sharedNodes.delete(0, sharedNodes.length);
            sharedLinks.delete(0, sharedLinks.length);
            set({ nodes: [], links: [] });
        },
    };
});
