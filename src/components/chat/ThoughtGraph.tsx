// src/components/chat/ThoughtGraph.tsx - UI holográfica del proceso cognitivo
import ForceGraph3D from 'react-force-graph-3d';
import { useRef, useEffect } from 'react';

interface ThoughtNode { id: string; label: string; status: 'pending' | 'active' | 'done' | 'error'; }
interface ThoughtLink { source: string; target: string; type: 'reason' | 'action' | 'memory'; }

export const ThoughtGraph = ({ jobId }: { jobId: string }) => {
    const graphRef = useRef<any>(null);

    // Conexión WebSocket al kernel para recibir actualizaciones
    useEffect(() => {
        // Si no hay jobId, evitamos conectar
        if (!jobId) return;

        let ws: WebSocket;
        try {
            ws = new WebSocket(`wss://api.nexa.os/ws/thought/${jobId}`);
            ws.onmessage = (event) => {
                try {
                    const { nodes, links, activeNode } = JSON.parse(event.data);
                    updateGraph(nodes, links, activeNode);
                } catch (e) { /* ignore parse error */ }
            };
        } catch (e) { /* connection fail */ }

        return () => ws?.close();
    }, [jobId]);

    const updateGraph = (nodes: ThoughtNode[], links: ThoughtLink[], highlight: string) => {
        if (graphRef.current) {
            graphRef.current.graphData({ nodes, links });
            // Efecto visual: pulsación en nodo activo con colores neón premium
            if (highlight) {
                graphRef.current.nodeColor((n: ThoughtNode) =>
                    n.id === highlight ? '#00f3ff' : n.status === 'done' ? '#00ff9d' : n.status === 'error' ? '#ff3366' : '#4b5563'
                );
            }
        }
    };

    return (
        <div className="w-full h-64 rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/60 backdrop-blur-xl relative shadow-[0_0_30px_rgba(0,243,255,0.05)] ring-1 ring-white/5 transition-all duration-500 group">

            {/* Ambient Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

            <ForceGraph3D
                ref={graphRef}
                graphData={{ nodes: [], links: [] }}
                nodeLabel="label"
                nodeColor={(n: any) => ({
                    pending: '#4b5563', active: '#00f3ff', done: '#00ff9d', error: '#ff3366'
                }[n.status as 'pending' | 'active' | 'done' | 'error'] || '#4b5563')}
                linkColor={(l: any) => ({
                    reason: '#8b5cf6', action: '#06b6d4', memory: '#f59e0b'
                }[l.type as 'reason' | 'action' | 'memory'] || '#374151')}
                backgroundColor="transparent"
                cooldownTicks={100}
                showNavInfo={false}
                nodeRelSize={6}
                nodeResolution={16}
                linkResolution={6}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
                linkDirectionalParticleWidth={2}
            />

            {/* Overlay de estado - HUD Style */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-2xl" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10 pointer-events-none bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
                <span className={`w-2 h-2 rounded-full ${jobId ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f3ff]' : 'bg-gray-500'}`} />
                <span className="text-[10px] tracking-widest text-cyan-100/70 font-mono font-medium">
                    {jobId ? `KERNEL_SYNC • ${jobId.slice(0, 8)}` : 'SYS_STANDBY'}
                </span>
            </div>

            <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
                <span className="text-[9px] tracking-wider text-gray-400 font-mono uppercase">
                    3D Thought Stream
                </span>
            </div>
        </div>
    );
};
