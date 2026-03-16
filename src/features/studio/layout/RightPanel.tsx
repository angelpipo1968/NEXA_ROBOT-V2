"use client";

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useRightPanelStore } from '@/lib/stores/useRightPanelStore';
import { useUiStore } from '@/store/uiStore';
import { useAiStore, AIEngine } from '@/store/aiStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Cpu,
    ShieldCheck,
    Activity,
    Brain,
    Globe,
    Zap,
    AlertTriangle,
    ChevronRight,
    Search
} from 'lucide-react';

export default function RightPanel() {
    const { projectData } = useProjectStore();
    const { showRightPanel } = useUiStore();
    const { aiConfig, setActiveEngine, aiSuggestions } = useAiStore();
    const { activeTab, setActiveTab, systemStatus, wisdomThoughts, lastDiagnosis } = useRightPanelStore();
    const [isScanning, setIsScanning] = React.useState(false);

    if (!showRightPanel) return null;

    return (
        <aside className="w-80 border-l border-white/5 bg-[#050508] flex flex-col h-full overflow-hidden">
            {/* Premium Glass Tabs */}
            <div className="flex p-2 gap-1 bg-black/40 border-b border-white/5">
                {[
                    { id: 'assistant', label: 'IA', icon: Sparkles },
                    { id: 'monitor', label: 'System', icon: Activity },
                    { id: 'publish', label: 'Distro', icon: Globe },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'assistant' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            {/* Cognitive Engine Selection */}
                            <section>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Cpu size={12} /> Cognitive Core
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'gemini', name: 'Gemini 2.5', color: 'blue' },
                                        { id: 'claude', name: 'Claude 3.7', color: 'amber' },
                                    ].map(engine => (
                                        <button
                                            key={engine.id}
                                            onClick={() => setActiveEngine(engine.id as AIEngine)}
                                            className={`p-3 rounded-2xl border transition-all text-left ${aiConfig.activeEngine === engine.id
                                                ? 'bg-indigo-600/10 border-indigo-500'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${engine.color}-500 mb-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]`} />
                                            <div className="text-[10px] font-bold text-white">{engine.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Wisdom Stream */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Brain size={12} /> Wisdom Stream
                                    </h4>
                                    <button
                                        onClick={async () => {
                                            setIsScanning(true);
                                            const { proactiveAgent } = await import('@/lib/services/proactiveAgent');
                                            try {
                                                await proactiveAgent.forceAnalyze();
                                            } finally {
                                                setIsScanning(false);
                                            }
                                        }}
                                        disabled={isScanning}
                                        className={`text-[8px] flex items-center gap-1 border transition-all rounded-full px-2 py-0.5 ${isScanning
                                                ? 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10 cursor-not-allowed'
                                                : 'border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-indigo-600/30'
                                            }`}
                                    >
                                        <Activity size={10} className={isScanning ? 'animate-spin' : ''} />
                                        {isScanning ? 'SCANNING...' : 'FORCE SCAN'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {wisdomThoughts.length === 0 && (
                                        <div className="p-8 text-center border border-dashed border-white/5 rounded-3xl opacity-30">
                                            <Search size={24} className="mx-auto mb-2" />
                                            <p className="text-[10px] uppercase">No hay sugerencias estelares</p>
                                        </div>
                                    )}
                                    {wisdomThoughts.map(thought => (
                                        <div key={thought.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all cursor-pointer group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${thought.type === 'REFACTOR' ? 'text-amber-400' :
                                                    thought.type === 'SECURITY' ? 'text-red-400' :
                                                        thought.type === 'PERF' ? 'text-emerald-400' :
                                                            thought.type === 'ARCH' ? 'text-indigo-400' : 'text-blue-400'
                                                    }`}>
                                                    {thought.type}
                                                </span>
                                                <Zap size={10} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed font-light">{thought.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'monitor' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            {/* System Status Radial */}
                            <section className="text-center">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <div className={`absolute inset-0 rounded-full border-2 ${systemStatus === 'alert' ? 'border-red-500 animate-ping' : 'border-indigo-500/20'
                                        }`} />
                                    <div className="absolute inset-2 rounded-full border border-white/10 flex flex-col items-center justify-center bg-white/[0.02]">
                                        <Activity className={systemStatus === 'nominal' ? 'text-green-500' : 'text-amber-500'} size={24} />
                                        <span className="text-[8px] font-black uppercase mt-1 tracking-widest text-gray-400">Health</span>
                                        <span className="text-[10px] font-black text-white uppercase">{systemStatus}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Stats Grid */}
                            <section className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Words', val: projectData.stats.words },
                                    { label: 'Complexity', val: 'Low' },
                                    { label: 'Immunity', val: 'Active' },
                                    { label: 'Latency', val: '12ms' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                                        <div className="text-[8px] font-black text-gray-600 uppercase mb-1">{stat.label}</div>
                                        <div className="text-sm font-bold text-white">{stat.val}</div>
                                    </div>
                                ))}
                            </section>

                            {/* Kernel Diagnosis */}
                            <section>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <ShieldCheck size={12} className="text-green-500" /> Kernel Immune Logs
                                </h4>
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    <p className="text-green-500/70">[SYS] Immune system online.</p>
                                    <p className="text-gray-500">[SYS] Analyzing project structural integrity...</p>
                                    {lastDiagnosis && <p className="text-amber-500">[WARN] {lastDiagnosis}</p>}
                                    <p className="text-indigo-400">[SYS] MemoryBridge indexed 14 entries.</p>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'publish' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-6"
                        >
                            <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                                <Globe className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-all" size={100} />
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Global Distro</h3>
                                <p className="text-[9px] text-indigo-300 uppercase font-black tracking-widest leading-relaxed">Publish to Decentralized Nodes</p>

                                <button className="mt-8 w-full py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl">
                                    Initialize Deployment
                                </button>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Connectors</h4>
                                {['Amazon KDP', 'WattySync', 'IPFS Hub'].map((connector, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer">
                                        <span className="text-xs font-bold text-gray-300">{connector}</span>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-all" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Status Hook */}
            <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Core Synchronized</span>
                </div>
                <span className="text-[8px] font-black text-indigo-500 uppercase">v3.0.4-Lts</span>
            </div>
        </aside>
    );
}
