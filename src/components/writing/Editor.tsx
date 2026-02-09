'use client';

import { useState, useEffect, useRef } from 'react';
import { useNexa } from '@/context/NexaContext';
import { Sparkles, PenLine, Lightbulb, Wand2, ArrowRight } from 'lucide-react';

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

    // Connect to real context if available
    const { generateIdeas } = useNexa();

    useEffect(() => {
        setWordCount(content.trim().split(/\s+/).filter(w => w.length > 0).length);
    }, [content]);

    // Update parent when local content changes
    useEffect(() => {
        if (onContentChange) onContentChange(content);
    }, [content, onContentChange]);

    const handleAiAssist = async (type: 'continue' | 'fix' | 'inspire') => {
        setIsAiProcessing(true);
        setAiSuggestion('');

        try {
            // In a real implementation this would call geminiClient via context
            console.log(`[Editor] AI Request: ${type}`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating thought

            let responseText = '';
            if (type === 'continue') {
                responseText = "\n\nLa brisa nocturna traía consigo el aroma a tierra mojada y antiguos secretos. No estaba sola, lo sabía, pero la oscuridad era un manto que la protegía, al menos por ahora.";
                setContent(prev => prev + responseText);
            } else if (type === 'fix') {
                setAiSuggestion("He detectado algunas repeticiones en el párrafo anterior. Sugiero cambiar 'oscuridad' por 'penumbra' para variar el ritmo.");
            } else if (type === 'inspire') {
                setAiSuggestion("¿Y si el personaje encuentra un objeto que no debería estar ahí? Un relicario antiguo o una carta fechada en el futuro.");
            }
        } catch (error) {
            console.error('AI Error:', error);
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f0f2f5] dark:bg-[#0f0f10] relative overflow-hidden">
            {/* Toolbar / Ribbon */}
            <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] flex items-center px-6 justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="font-serif italic text-gray-900 dark:text-white">
                        {wordCount} palabras
                    </span>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                    <span className="text-xs uppercase tracking-wider">Capítulo 1</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAiAssist('continue')}
                        disabled={isAiProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-all shadow-sm hover:shadow"
                    >
                        {isAiProcessing ? <Sparkles size={14} className="animate-spin" /> : <PenLine size={14} />}
                        Continuar Escribiendo
                    </button>
                    <button
                        onClick={() => handleAiAssist('fix')}
                        disabled={isAiProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium transition-all"
                    >
                        <Wand2 size={14} className="text-purple-500" />
                        Refinar Estilo
                    </button>
                    <button
                        onClick={() => handleAiAssist('inspire')}
                        disabled={isAiProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium transition-all"
                    >
                        <Lightbulb size={14} className="text-yellow-500" />
                        Ideas
                    </button>
                </div>
            </div>

            {/* Editor Surface (The "Page") */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#f5f7fa] dark:bg-[#050505] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <div className="w-full max-w-3xl bg-white dark:bg-[#121212] min-h-[800px] shadow-xl rounded-sm p-12 relative transition-all duration-300">

                    {/* Page header visual cue */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-800 to-transparent opacity-50"></div>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[700px] bg-transparent resize-none focus:outline-none font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-700 selection:bg-indigo-100 dark:selection:bg-indigo-900/30"
                        placeholder="Escribe aquí tu historia... El papel en blanco es el comienzo de todo universo."
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* AI Suggestion Floating Card */}
            {aiSuggestion && (
                <div className="absolute bottom-6 right-6 max-w-sm bg-white dark:bg-[#1a1a1a] border border-purple-100 dark:border-purple-900/30 shadow-2xl rounded-xl p-5 animate-in slide-in-from-bottom-4 z-50">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Sugerencia lA</span>
                        </div>
                        <button
                            onClick={() => setAiSuggestion('')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {aiSuggestion}
                    </p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors">
                            Aplicar
                        </button>
                        <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors">
                            Descartar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
