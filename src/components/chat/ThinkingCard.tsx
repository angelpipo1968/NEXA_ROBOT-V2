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
        <div className="my-2 border border-white/10 rounded-lg bg-black/20 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${toolName === 'sequential_thinking' ? 'text-purple-300' : 'text-gray-300'
                    } hover:bg-white/5`}
            >
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className="font-medium truncate max-w-[250px]">{getTitle()}</span>
                    {toolName === 'sequential_thinking' && (
                        <span className="text-[10px] text-purple-500/80 font-mono ml-2">
                            STEP {toolArgs.thoughtNumber}/{toolArgs.totalThoughts}
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isExpanded && (
                <div className="px-3 py-2 border-t border-white/10 bg-black/40 text-xs font-mono text-gray-400 overflow-x-auto">
                    <div className="mb-1 text-gray-500 uppercase text-[10px] tracking-wider font-bold">Arguments</div>
                    <pre className="mb-2 whitespace-pre-wrap">{JSON.stringify(toolArgs, null, 2)}</pre>

                    {result && (
                        <>
                            <div className="mb-1 text-green-500 uppercase text-[10px] tracking-wider font-bold mt-2">Result</div>
                            <pre className="whitespace-pre-wrap text-green-400/80">{result}</pre>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
