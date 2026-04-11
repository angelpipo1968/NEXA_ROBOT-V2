// src/components/chat/ThoughtGraph.tsx - Neural Singularity Visualization
import ForceGraph3D from 'react-force-graph-3d';
import { useRef, useState, useMemo } from 'react';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { X, Cpu, Info, Clock } from 'lucide-react';

export const ThoughtGraph = () => {
    const graphRef = useRef<any>(null);
    const { nodes, links } = useThoughtStore();
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // Prepare data for the graph
    const graphData = useMemo(() => ({
        nodes: nodes.map(n => ({
            ...n,
            name: n.label, // Use label for hover
        })),
        links: links.map(l => ({
            source: l.source,
            target: l.target
        }))
    }), [nodes, links]);

    const handleNodeClick = (node: any) => {
        setSelectedNode(node);
        // Aim at node
        if (graphRef.current) {
            const distance = 100;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            graphRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new pos
                node, // lookAt property
                2000  // ms transition duration
            );
        }
    };

    return (
        <div className="w-full h-[350px] rounded-3xl overflow-hidden border border-violet-500/20 bg-black/40 backdrop-blur-3xl relative shadow-[0_0_50px_rgba(139,92,246,0.1)] ring-1 ring-white/10 transition-all duration-700 group">
            
            {/* Ambient Neural Glow */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <ForceGraph3D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="label"
                nodeColor={(n: any) => n.color || '#8b5cf6'}
                linkColor={() => '#4b5563'}
                backgroundColor="transparent"
                showNavInfo={false}
                nodeRelSize={7}
                nodeResolution={24}
                linkResolution={8}
                linkWidth={1}
                linkDirectionalParticles={3}
                linkDirectionalParticleSpeed={0.015}
                linkDirectionalParticleWidth={1.5}
                onNodeClick={handleNodeClick}
                enableNodeDrag={false}
            />

            {/* Selected Node Details Overlay */}
            {selectedNode && (
                <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                                <Cpu size={18} className="text-violet-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest">{selectedNode.label}</h4>
                                <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500 font-mono">
                                    <Clock size={10} />
                                    {new Date(selectedNode.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedNode(null)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={12} className="text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Detalles del Pensamiento</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                            {selectedNode.details || "No hay meta-datos adicionales para este paso."}
                        </p>
                    </div>
                </div>
            )}

            {/* SYNC HUD Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10 pointer-events-none">
                <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl ring-1 ring-white/5">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-ping absolute inset-0 opacity-40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-400 relative border border-white/20" />
                    </div>
                    <span className="text-[10px] tracking-[0.2em] text-violet-100/90 font-black uppercase">
                        NEURAL_SYNC_v4.0
                    </span>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <span className="text-[9px] text-gray-500 font-mono">NODES: {nodes.length}</span>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
                    <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Singularity Stream</span>
                </div>
            </div>
        </div>
    );
};
