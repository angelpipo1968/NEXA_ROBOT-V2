import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Search, FileCode, BrainCircuit } from 'lucide-react';

interface ThinkingCardProps {
    toolName: string;
    toolArgs: any;
    isFinished?: boolean;
    result?: string;
}

export default function ThinkingCard({ toolName, toolArgs, isFinished = true, result }: ThinkingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIcon = () => {
        if (toolName === 'search_web') return <Search size={16} className="text-blue-400" />;
        if (toolName === 'create_artifact') return <FileCode size={16} className="text-green-400" />;
        if (toolName === 'sequential_thinking') return <BrainCircuit size={16} className="text-purple-400 animate-pulse" />;
        if (toolName === 'save_knowledge') return <BrainCircuit size={16} className="text-[var(--vp-accent-purple)]" />;
        if (toolName === 'codebase_search' || toolName === 'index_codebase') return <Search size={16} className="text-blue-400" />;
        return <Loader2 size={16} className="text-gray-400 animate-spin" />;
    };

    const getTitle = () => {
        const args = toolArgs || {};
        if (toolName === 'search_web') return `Searching: "${args.query || '...'}"`;
        if (toolName === 'create_artifact') return `Generating file: ${args.filename || '...'}`;
        if (toolName === 'sequential_thinking') return `${args.thought || 'Thinking...'}`;
        if (toolName === 'save_knowledge') return `Saving memory: ${args.title || '...'}`;
        if (toolName === 'codebase_search') return `Semantic Search: "${args.query || '...'}"`;
        if (toolName === 'index_codebase') return `Indexing Project...`;
        return `Executing: ${toolName}`;
    };

    return (
        <div className={`my-2 border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-white/10 shadow-2xl bg-black/60' : 'bg-black/20 hover:bg-black/30'
            } ${toolName === 'sequential_thinking' ? 'border-purple-500/30' : 'border-white/10'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${toolName === 'sequential_thinking' ? 'text-purple-100 bg-purple-500/5' : 'text-gray-200'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${toolName === 'sequential_thinking' ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                        {getIcon()}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold tracking-tight truncate max-w-[280px]">{getTitle()}</span>
                        {toolName === 'sequential_thinking' && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-1 w-24 bg-purple-900/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                        style={{ width: `${(toolArgs.thoughtNumber / (toolArgs.totalThoughts || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">
                                    STEP {toolArgs.thoughtNumber}/{toolArgs.totalThoughts}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                    <ChevronRight size={16} className="text-gray-500" />
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 py-3 border-t border-white/5 bg-black/40 text-[11px] font-mono leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-[9px] tracking-widest font-black">
                        <div className="h-px flex-1 bg-white/5" />
                        Execution Details
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <pre className="mb-3 whitespace-pre-wrap text-gray-400 opacity-80 max-h-[200px] overflow-y-auto scrollbar-hide">
                        {JSON.stringify(toolArgs, null, 2)}
                    </pre>

                    {result && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-emerald-500 uppercase text-[9px] tracking-widest font-black">
                                <div className="h-px flex-1 bg-emerald-500/10" />
                                Output Result
                                <div className="h-px flex-1 bg-emerald-500/10" />
                            </div>
                            <pre className="whitespace-pre-wrap text-emerald-400/90 max-h-[300px] overflow-y-auto scrollbar-hide py-1">
                                {result}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
