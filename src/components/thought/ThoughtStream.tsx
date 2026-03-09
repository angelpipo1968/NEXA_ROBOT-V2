import React, { useRef, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { Brain, Trash2, Zap } from 'lucide-react';

export function ThoughtStream() {
    const { nodes, links, clearStream } = useThoughtStore((state) => state);
    const fgRef = useRef<any>();

    const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

    return (
        <div className="h-full w-full bg-[#050510] relative flex flex-col">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl backdrop-blur-xl">
                    <Brain className="text-purple-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tighter">COGNITIVE STREAM</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase italic">Nexa OS Reasoning Core</p>
                </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                <button
                    onClick={clearStream}
                    className="p-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    title="Clear Stream"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex-1">
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    backgroundColor="#050510"
                    nodeAutoColorBy="group"
                    nodeLabel={(node: any) => `<div class="bg-black/90 p-4 border border-purple-500/20 rounded-xl">
                        <p class="text-xs font-black text-purple-400 mb-1 uppercase tracking-tighter">${node.label}</p>
                        <p class="text-[10px] text-gray-400 leading-relaxed">${node.details || 'Processing fragment...'}</p>
                    </div>`}
                    nodeVal={(node: any) => node.val || 5}
                    linkColor={() => '#4c1d95'}
                    linkDirectionalParticles={4}
                    linkDirectionalParticleSpeed={0.01}
                    enableNodeDrag={true}
                    showNavInfo={false}
                />
            </div>

            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-4 max-w-xs animate-pulse">
                        <Zap size={48} className="text-purple-500/40 mx-auto" />
                        <p className="text-gray-500 text-sm font-light leading-relaxed">
                            No hay procesos activos. Inicia un chat o una tarea en el Studio para visualizar la cognición espacial.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
