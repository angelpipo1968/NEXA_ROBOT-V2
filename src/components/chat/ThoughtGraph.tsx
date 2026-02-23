// src/components/chat/ThoughtGraph.tsx - UI holográfica del proceso cognitivo
import ForceGraph3D from 'react-force-graph-3d';
import { useRef, useEffect } from 'react';

interface ThoughtNode { id: string; label: string; status: 'pending' | 'active' | 'done' | 'error'; }
interface ThoughtLink { source: string; target: string; type: 'reason' | 'action' | 'memory'; }

export const ThoughtGraph = ({ jobId }: { jobId: string }) => {
    const graphRef = useRef<any>();

    // Conexión WebSocket al kernel para recibir actualizaciones
    useEffect(() => {
        // Si no hay jobId, evitamos conectar
        if (!jobId) return;

        const ws = new WebSocket(`wss://api.nexa.os/ws/thought/${jobId}`);
        ws.onmessage = (event) => {
            try {
                const { nodes, links, activeNode } = JSON.parse(event.data);
                updateGraph(nodes, links, activeNode);
            } catch (e) { /* ignore parse error */ }
        };
        return () => ws.close();
    }, [jobId]);

    const updateGraph = (nodes: ThoughtNode[], links: ThoughtLink[], highlight: string) => {
        if (graphRef.current) {
            graphRef.current.graphData({ nodes, links });
            // Efecto visual: pulsación en nodo activo
            if (highlight) {
                graphRef.current.nodeColor((n: ThoughtNode) =>
                    n.id === highlight ? '#00f3ff' : n.status === 'done' ? '#00ff9d' : n.status === 'error' ? '#ff4757' : '#666'
                );
            }
        }
    };

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-cyan-500/30 bg-black/40 relative">
            <ForceGraph3D
                ref={graphRef}
                graphData={{ nodes: [], links: [] }}
                nodeLabel="label"
                nodeColor={(n: any) => ({
                    pending: '#666', active: '#00f3ff', done: '#00ff9d', error: '#ff4757'
                }[n.status] || '#666')}
                linkColor={(l: any) => ({
                    reason: '#8b5cf6', action: '#06b6d4', memory: '#f59e0b'
                }[l.type] || '#ccc')}
                backgroundColor="transparent"
                cooldownTicks={100}
            />
            {/* Overlay de estado */}
            <div className="absolute bottom-2 left-2 text-xs text-cyan-300 font-mono z-10 pointer-events-none">
                NEXA THINKING • {jobId ? jobId.slice(0, 8) : 'STANDBY'}
            </div>
        </div>
    );
};
