import React, { useState } from 'react';
import { toolService } from '@/lib/toolService';
import { ShoppingBag, CheckCircle, Plus, Info, Zap, Globe, Cpu } from 'lucide-react';

export function ToolMarketplace() {
    const [search, setSearch] = useState('');

    // Mock tools that could be added via MCP
    const tools = [
        { id: 'web-search', name: 'Web Navigator Pro', provider: 'Nexa MCP', type: 'Intelligence', description: 'Búsqueda profunda en tiempo real con filtrado de ruido.', status: 'installed' },
        { id: 'sql-agent', name: 'DB Architect', provider: 'Nexa MCP', type: 'Database', description: 'Generación y ejecución segura de consultas SQL complejas.', status: 'available' },
        { id: 'figma-sync', name: 'UI Sync (Figma)', provider: 'External', type: 'Design', description: 'Extrae tokens de diseño y componentes directamente de Figma.', status: 'available' },
        { id: 'video-gen', name: 'Motion Engine', provider: 'Claude MCP', type: 'Media', description: 'Generación de videos cortos a partir de descripciones de escena.', status: 'available' },
        { id: 'code-audit', name: 'Security Auditor', provider: 'Audit Package', type: 'Security', description: 'Análisis estático de vulnerabilidades en tiempo de escritura.', status: 'installed' },
    ];

    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full bg-[#080808] flex flex-col p-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <ShoppingBag className="text-pink-500" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nexa Marketplace</h2>
                    </div>
                    <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em]">Model Context Protocol (MCP) Extensions</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar herramientas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:ring-1 focus:ring-pink-500 outline-none"
                        />
                    </div>
                    <button className="px-6 py-2 bg-white text-black rounded-xl font-bold text-xs uppercase hover:bg-pink-500 hover:text-white transition-all">
                        Importar MCP URL
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map(tool => (
                    <div key={tool.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:border-pink-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all">
                            {tool.type === 'Intelligence' && <Zap size={40} className="text-pink-500" />}
                            {tool.type === 'Database' && <Cpu size={40} className="text-cyan-500" />}
                            {tool.type === 'Design' && <Globe size={40} className="text-purple-500" />}
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${tool.status === 'installed' ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'
                                }`}>
                                {tool.status}
                            </span>
                            <span className="text-gray-600 text-[10px] font-mono">{tool.provider}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6 h-12 overflow-hidden">
                            {tool.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <button className="text-gray-500 hover:text-white transition-all">
                                <Info size={18} />
                            </button>

                            {tool.status === 'installed' ? (
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-bold border border-green-500/20">
                                    <CheckCircle size={14} /> Activo
                                </button>
                            ) : (
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl text-xs font-bold border border-white/10 hover:bg-pink-500 hover:border-pink-500 transition-all">
                                    <Plus size={14} /> Instalar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-8 border border-dashed border-white/10 rounded-3xl text-center">
                <Plus className="mx-auto text-gray-700 mb-4" size={32} />
                <h4 className="text-white font-bold mb-1 italic">¿Eres desarrollador?</h4>
                <p className="text-gray-500 text-xs mb-6">Crea tu propio servidor MCP y conéctalo a Nexa OS en segundos.</p>
                <button className="text-pink-400 text-xs font-black uppercase tracking-widest hover:text-pink-300 transition-all">
                    Ver documentación de SDK &rarr;
                </button>
            </div>
        </div>
    );
}
