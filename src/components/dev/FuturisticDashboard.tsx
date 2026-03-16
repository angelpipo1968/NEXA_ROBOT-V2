import React from 'react';
import {
    Activity,
    Cpu,
    Globe,
    Shield,
    Zap,
    BarChart3,
    Layers,
    Search,
    Bell,
    Settings,
    HardDrive,
    Terminal,
    Power,
    Play,
    Pause,
    Eye,
    Scan
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useProductivityGuardian } from '../../lib/hooks/useProductivityGuardian';
import { useAchievementStore } from '../../lib/stores/useAchievementStore';

export default function FuturisticDashboard() {
    const [localStatus, setLocalStatus] = useState<any>({ status: 'stopped', logs: [] });
    const [visionStatus, setVisionStatus] = useState<any>({ status: 'stopped', logs: [] });
    const [visionResult, setVisionResult] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Qwen2-0.5B');
    const [isLoading, setIsLoading] = useState(false);
    const [guardianActive, setGuardianActive] = useState(false);
    const [extremeFocus, setExtremeFocus] = useState(false);
    const [mentalHealthReport, setMentalHealthReport] = useState('');
    const [achievements, setAchievements] = useState<any[]>([]); // Added achievements state

    const {
        tips,
        isAnalyzing: isGuardianAnalyzing,
        deepWorkMinutes,
        mentalState,
        generateMentalHealthReport,
        achievements: guardianAchievements // Renamed to avoid conflict with local state
    } = useProductivityGuardian(guardianActive, extremeFocus);

    // Update local achievements state when guardianAchievements change
    useEffect(() => {
        if (guardianAchievements) {
            setAchievements(guardianAchievements);
        }
    }, [guardianAchievements]);

    // Polling Backend Status
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/status?id=llm`);
                const data = await res.json();
                if (data.success) setLocalStatus(data);

                const resV = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/status?id=vlm`);
                const dataV = await resV.json();
                if (dataV.success) setVisionStatus(dataV);
            } catch (e) { }
        };
        const interval = setInterval(fetchStatuses, 3000);
        return () => clearInterval(interval);
    }, []);

    const toggleLocalCore = async (id: string = 'llm', model: string = selectedModel, port: number = 3002) => {
        setIsLoading(true);
        const statusObj = id === 'llm' ? localStatus : visionStatus;
        const endpoint = statusObj.status === 'stopped' ? 'start' : 'stop';
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, modelId: model, port })
            });
        } catch (e) { } finally {
            setIsLoading(false);
        }
    };

    const runVisionScan = async () => {
        setIsScanning(true);
        setVisionResult('Capturing & Analyzing...');
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/local/vision/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: "What am I looking at right now? Be specific." })
            });
            const data = await res.json();
            setVisionResult(data.analysis || 'Analysis failed.');
        } catch (e) {
            setVisionResult('VLM Server Error. Is it Running?');
        } finally {
            setIsScanning(false);
        }
    };
    const stats = [
        { label: 'Neural Processing', value: '98.4%', icon: Cpu, color: 'text-purple-400' },
        { label: 'Network Latency', value: '12ms', icon: Globe, color: 'text-blue-400' },
        { label: 'Security Shield', value: 'Active', icon: Shield, color: 'text-emerald-400' },
        { label: 'Energy Output', value: '1.2 GW', icon: Zap, color: 'text-amber-400' },
    ];

    const { currentToolCalls, unlockAllAchievements } = useAchievementStore();

    return (
        <div className="min-h-[100dvh] bg-[#05060f] text-slate-200 p-6 font-sans selection:bg-purple-500/30">
            {/* Top Navigation */}
            <nav className="flex items-center justify-between mb-10 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Activity className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">NEXA <span className="text-purple-500">PRO</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Core</a>
                    <a href="#" className="hover:text-white transition-colors">Systems</a>
                    <a href="#" className="hover:text-white transition-colors">Neural</a>
                    <a href="#" className="hover:text-white transition-colors">Security</a>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Deep Search..."
                            className="bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-purple-500 outline-none w-48 transition-all focus:w-64"
                        />
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#05060f]" />
                    </button>
                    <div className="w-10 h-10 rounded-full border-2 border-purple-500/50 p-0.5">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Angel" className="rounded-full bg-slate-800" alt="Avatar" />
                    </div>
                </div>
            </nav>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Stats Column */}
                <div className="lg:col-span-1 space-y-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all group flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-6 h-6 rounded-full border-2 border-[#0d0e1b] bg-slate-800 text-[8px] flex items-center justify-center font-bold">
                                            {j}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Center Main Graph Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden h-[400px]">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -ml-20 -mb-20" />

                        <div className="flex items-center justify-between relative z-10 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Neural Pulse Graph</h2>
                                <p className="text-sm text-slate-500">Real-time cognitive load distribution</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">24H</button>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/25">LIVE</button>
                            </div>
                        </div>

                        {/* Mock Graph Visualization */}
                        <div className="flex items-end justify-between h-48 gap-2 px-2 relative z-10 mt-10">
                            {[40, 70, 45, 90, 65, 85, 40, 55, 95, 70, 50, 80].map((h, i) => (
                                <div key={i} className="flex-1 group relative flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t ${i === 8 ? 'from-purple-600 to-pink-500' : 'from-slate-800 to-slate-700'} group-hover:from-purple-500 group-hover:to-blue-400`}
                                        style={{ height: `${h}%` }}
                                    />
                                    <div className="absolute -top-8 px-2 py-1 bg-slate-800 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Weekly Delta</p>
                                <h5 className="text-lg font-bold text-white">+12.42%</h5>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <Layers size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Cache Integrity</p>
                                <h5 className="text-lg font-bold text-white">HEALTHY</h5>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Action Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Settings size={16} className="text-slate-400" />
                            Quick Controls
                        </h3>
                        <div className="space-y-4">
                            <ControlSwitch
                                label="Auto-Deep Search"
                                active={true}
                                onChange={() => { }}
                            />
                            <ControlSwitch
                                label="Productivity Guardian"
                                active={guardianActive}
                                onChange={() => setGuardianActive(!guardianActive)}
                            />
                            <ControlSwitch
                                label="Extreme Focus Mode"
                                active={extremeFocus}
                                onChange={() => setExtremeFocus(!extremeFocus)}
                                disabled={!guardianActive}
                            />
                            <ControlSwitch
                                label="Log Verbosity"
                                active={true}
                                onChange={() => { }}
                            />

                            <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-xl shadow-purple-900/40">
                                Execute Full Scan
                            </button>
                        </div>
                    </div>

                    {/* ACHIEVEMENT WALL HUD */}
                    <div className="bg-[#05060f]/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center justify-between gap-2">
                            Aurora Merit Protocol
                            <div className="flex gap-2">
                                <button
                                    onClick={() => unlockAllAchievements()}
                                    className="text-[7px] text-purple-400 hover:text-white border border-purple-500/30 px-2 py-0.5 rounded transition-all"
                                >
                                    SYNC NEXUS
                                </button>
                                <button
                                    onClick={() => {
                                        const msg = new SpeechSynthesisUtterance("Aurora Protocol engaged. Antigravity System ready. Focusing on your creation.");
                                        const voices = window.speechSynthesis.getVoices();
                                        const femaleVoice = voices.find(v => (v.name + v.lang).toLowerCase().includes('female') || (v.name + v.lang).toLowerCase().includes('zira') || (v.name + v.lang).toLowerCase().includes('helena'));
                                        if (femaleVoice) msg.voice = femaleVoice;
                                        msg.pitch = 1.1;
                                        msg.rate = 1.0;
                                        window.speechSynthesis.speak(msg);
                                    }}
                                    className="text-[7px] text-cyan-400 hover:text-white border border-cyan-500/30 px-2 py-0.5 rounded transition-all"
                                >
                                    GREET AURORA
                                </button>
                            </div>
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((a) => (
                                <div
                                    key={a.id}
                                    className={`relative p-3 rounded-xl border transition-all duration-700 ${a.unlockedAt
                                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                        : 'bg-white/5 border-white/5 grayscale opacity-40'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center gap-1">
                                        <span className={`text-xl mb-1 ${a.unlockedAt ? 'animate-bounce' : ''}`}>{a.icon}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-wider ${a.unlockedAt ? 'text-cyan-400' : 'text-slate-500'}`}>
                                            {a.name}
                                        </span>
                                        <span className="text-[6px] text-slate-600 font-medium leading-tight">
                                            {a.description}
                                        </span>
                                        {a.unlockedAt && (
                                            <div className="absolute -top-1 -right-1">
                                                <span className="flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Productivity Guardian Card */}
                    <div className={`bg-[#05060f]/80 border ${guardianActive ? 'border-amber-500/30 shadow-lg shadow-amber-500/10' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden transition-all duration-500`}>
                        <div className={`absolute -top-10 -left-10 w-32 h-32 ${guardianActive ? 'bg-amber-500/10' : 'bg-slate-500/5'} rounded-full blur-3xl`} />
                        <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            Guardian Insights
                            <div className="flex items-center gap-2">
                                {extremeFocus && <span className="text-[7px] font-bold text-red-500 animate-pulse border border-red-500/30 px-1 rounded">EXTREME FOCUS ACTIVE</span>}
                                {isGuardianAnalyzing && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />}
                            </div>
                        </h3>

                        {/* FLOW STATS HUD */}
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                                <span className="text-[7px] text-slate-500 uppercase block mb-1">Total Flow Time</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white">{deepWorkMinutes}</span>
                                    <span className="text-[8px] text-slate-500 uppercase">min</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                                <span className="text-[7px] text-slate-500 uppercase block mb-1">Neural State</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${mentalState === 'focused' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' :
                                        mentalState === 'strained' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' :
                                            'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                        }`} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-wider">{mentalState}</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                                <span className="text-[7px] text-slate-500 uppercase block mb-1">Cognitive Load</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-cyan-400">{currentToolCalls}</span>
                                    <span className="text-[8px] text-slate-500 uppercase">tools</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10 mb-4">
                            {tips.length === 0 ? (
                                <p className="text-[9px] text-slate-500 italic">No insights generated yet. Activate Guardian to monitor productivity.</p>
                            ) : (
                                tips.map((tip) => (
                                    <div key={tip.id} className={`p-2 rounded-lg border ${tip.urgency === 'high' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[7px] font-bold uppercase ${tip.urgency === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                                                {tip.urgency} Alert
                                            </span>
                                            <span className="text-[7px] text-slate-600">{new Date(tip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-200 leading-tight">{tip.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {guardianActive && (
                            <button
                                onClick={async () => {
                                    setMentalHealthReport('Analyzing cognitive patterns...');
                                    const report = await generateMentalHealthReport();
                                    setMentalHealthReport(report);
                                }}
                                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-[8px] font-black uppercase tracking-widest text-amber-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Terminal size={12} /> Generate Mental Health & Flow Report
                            </button>
                        )}

                        {mentalHealthReport && (
                            <div className="mt-4 bg-[#1a1b2e] border border-amber-500/20 rounded-xl p-4 overflow-y-auto max-h-48">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] text-amber-400 font-black uppercase tracking-widest">Cognitive Flow Diagnostic</span>
                                    <button onClick={() => setMentalHealthReport('')} className="text-[7px] text-slate-500 hover:text-white uppercase">Dismiss</button>
                                </div>
                                <p className="text-[9px] text-slate-300 leading-relaxed font-serif italic text-justify">
                                    {mentalHealthReport}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={`bg-[#0a0b1e] border ${localStatus.status === 'running' ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-purple-500/20'} rounded-2xl p-6 relative overflow-hidden transition-all duration-500`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${localStatus.status === 'running' ? 'bg-emerald-500/10' : 'bg-purple-500/10'} rounded-full -mr-10 -mt-10 blur-2xl`} />

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <HardDrive size={14} className={localStatus.status === 'running' ? 'text-emerald-400' : 'text-purple-400'} />
                                On-Device Neural Engine
                            </h3>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${localStatus.status === 'running' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-500/50 text-slate-400 bg-slate-500/10'}`}>
                                {localStatus.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold text-slate-300 outline-none focus:border-purple-500"
                                disabled={localStatus.status !== 'stopped'}
                            >
                                <option value="Qwen2-0.5B">Qwen2-0.5B (Edge-NPU)</option>
                                <option value="Llama-3.2-1B">Llama-3.2-1B (Balanced)</option>
                                <option value="Whisper-Tiny">Whisper-Tiny (Voice ASR)</option>
                            </select>

                            <button
                                onClick={() => toggleLocalCore()}
                                disabled={isLoading || localStatus.status === 'starting'}
                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${localStatus.status === 'stopped'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                    : 'bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2 animate-pulse">Processing...</span>
                                ) : localStatus.status === 'stopped' ? (
                                    <><Play size={12} fill="currentColor" /> Activate Native Core</>
                                ) : (
                                    <><Pause size={12} fill="currentColor" /> Deactivate Core</>
                                )}
                            </button>

                            <div className="bg-black/60 rounded-lg p-3 border border-white/5 space-y-1.5 max-h-32 overflow-y-auto font-mono scrollbar-hide">
                                <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-1">
                                    <Terminal size={10} className="text-slate-500" />
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">Neural Stream Log</span>
                                </div>
                                {localStatus.logs.length === 0 ? (
                                    <p className="text-[8px] text-slate-600 italic">No activity logs recorded...</p>
                                ) : (
                                    localStatus.logs.map((log: string, i: number) => (
                                        <p key={i} className="text-[8px] text-slate-400 whitespace-pre-wrap leading-relaxed truncate">
                                            {log}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-600">PORT: 3002</span>
                            <div className="flex gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${localStatus.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                            </div>
                        </div>
                    </div>

                    {/* VLM Vision Hub Card */}
                    <div className={`bg-[#0d0c1b] border ${visionStatus.status === 'running' ? 'border-blue-500/30' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden transition-all duration-500`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Eye size={14} className="text-blue-400" />
                                Nexus Visual Stream
                            </h3>
                            <button
                                onClick={() => toggleLocalCore('vlm', 'Qwen2-VL-2B-Instruct-GGUF', 3003)}
                                className={`px-2 py-1 rounded text-[8px] font-bold ${visionStatus.status === 'running' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-500'}`}
                            >
                                {visionStatus.status.toUpperCase()}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={runVisionScan}
                                disabled={visionStatus.status !== 'running' || isScanning}
                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${visionStatus.status === 'running'
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                <Scan size={14} /> {isScanning ? 'Scanning Alpha...' : 'Scan Screen'}
                            </button>

                            {visionResult && (
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                    <p className="text-[9px] text-blue-300 italic leading-relaxed">
                                        "{visionResult}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ControlSwitch({ label, active, onChange, disabled = false }: { label: string, active: boolean, onChange: () => void, disabled?: boolean }) {
    return (
        <div
            className={`flex items-center justify-between py-2 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer group'}`}
            onClick={() => !disabled && onChange()}
        >
            <span className={`text-xs font-medium transition-colors ${active ? 'text-white' : 'text-slate-400'} ${!disabled && 'group-hover:text-white'}`}>{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-purple-600' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
            </div>
        </div>
    );
}
