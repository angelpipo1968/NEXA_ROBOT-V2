'use client';

import { useState, useEffect, useRef } from 'react';

interface EditorProps {
    initialContent?: string;
    bookId: string;
    onContentChange?: (content: string) => void;
}

export function Editor({ initialContent = '', bookId, onContentChange }: EditorProps) {
    const [content, setContent] = useState(initialContent);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setWordCount(content.trim().split(/\s+/).filter(w => w.length > 0).length);
    }, [content]);

    const handleAiAssist = async (type: 'continue' | 'suggest' | 'inspire') => {
        setIsAiProcessing(true);
        setAiSuggestion('');

        try {
            // Simulation of API call to WritingEngine
            // In a real app, this would call an API route that uses WritingEngine
            console.log(`Requesting AI assistance: ${type}`);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay

            let responseText = '';
            if (type === 'continue') {
                responseText = " ...and suddenly, the room fell silent. A shadow moved across the far wall, distinct from the others.";
            } else if (type === 'suggest') {
                setAiSuggestion("Try describing the protagonist's emotional state here. How does the silence make them feel?");
            } else if (type === 'inspire') {
                setAiSuggestion("What if the shadow wasn't cast by anything in the room?");
            }

            if (responseText) {
                const newContent = content + responseText;
                setContent(newContent);
            }
        } catch (error) {
            console.error('AI Error:', error);
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Toolbar */}
                <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Bold">
                            <b>B</b>
                        </button>
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Italic">
                            <i>I</i>
                        </button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                            {wordCount} Words
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAiAssist('continue')}
                            disabled={isAiProcessing}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isAiProcessing ? 'Thinking...' : '⚡ Auto-Complete'}
                        </button>
                        <button
                            onClick={() => handleAiAssist('suggest')}
                            disabled={isAiProcessing}
                            className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-full text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                            ✨ Magic Wand
                        </button>
                    </div>
                </div>

                {/* Editor Surface */}
                <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-950">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (onContentChange) onContentChange(e.target.value);
                        }}
                        className="w-full h-full p-8 bg-transparent text-lg resize-none focus:outline-none font-serif leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="Start writing your masterpiece..."
                    />

                    {/* AI Suggestion Overlay */}
                    {aiSuggestion && (
                        <div className="absolute bottom-8 right-8 max-w-sm bg-white dark:bg-gray-800 border border-purple-500/30 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-5 z-20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">AI Suggestion</span>
                                <button
                                    onClick={() => setAiSuggestion('')}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                                {aiSuggestion}
                            </p>
                            <div className="flex gap-2">
                                <button className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded font-medium transition-colors">
                                    Accept
                                </button>
                                <button className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded font-medium transition-colors">
                                    Regenerate
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Right) - Collapsible logic could be added here if needed */}
            <div className="hidden xl:block w-72 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-4 shrink-0 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4">
                        AI Assistant
                    </h3>
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400 min-h-[100px] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                        Select text to get specific analysis or advice.
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4">
                        Notes
                    </h3>
                    <textarea
                        className="w-full h-64 bg-white dark:bg-gray-800/20 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                        placeholder="Jot down ideas here..."
                    />
                </div>
            </div>
        </div>
    );
}
