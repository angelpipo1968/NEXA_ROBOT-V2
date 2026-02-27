import { useProjectStore } from '@/store/projectStore';
'use client';

import React, { useState, useRef, useEffect } from 'react';

import { VoiceSynthesisEngine } from '@/packages/studio/src/voice/VoiceSynthesisEngine';
import { AIWritingEngine } from '@/packages/studio/src/ai/WritingEngine';
import { BookResearchCore } from '@/packages/search-service/src/BookResearchCore';
import { ExpandirPanel } from '@/features/studio/components/ExpandirPanel';

// Mock AICorrector component-side wrapper (Inline for now as in ProfessionalEditor)
class AICorrectorWrapper {
    async analyze(content: string) {
        const corrections = [];
        // Basic heuristics for demo
        if (content.length > 0 && !/^[A-Z]/.test(content)) {
            corrections.push({ type: 'Ortografía', confidence: 95, suggestion: 'Comienza con mayúscula.' });
        }
        if (content.includes('  ')) {
            corrections.push({ type: 'Estilo', confidence: 88, suggestion: 'Elimina espacios dobles.' });
        }
        if (content.length > 50 && !content.includes('.')) {
            corrections.push({ type: 'Gramática', confidence: 90, suggestion: 'Añade un punto final.' });
        }
        return corrections;
    }
}

export default function EditorPanel() {
        const { projectData, updateProjectContent } = useProjectStore();
    const [content, setContent] = useState(projectData.content || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [corrections, setCorrections] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [writingMode, setWritingMode] = useState<'creative' | 'professional' | 'technical'>('professional');

    // Voice Control State
    const [selectedVoice, setSelectedVoice] = useState('human-male');
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);

    const editorRef = useRef<HTMLDivElement>(null);
    // Initialize refs with class instances. Note: In a real app, these might be singletons or provided via context.
    const corrector = useRef(new AICorrectorWrapper());
    const voiceEngine = useRef(new VoiceSynthesisEngine());
    const aiWriter = useRef(new AIWritingEngine());
    const researchEngine = useRef(new BookResearchCore());

    const [researchPanel, setResearchPanel] = useState<any>(null);
    const [showExpandirPanel, setShowExpandirPanel] = useState(false);
    const [selectedContext, setSelectedContext] = useState('');

    // Sync from projectData to local state when projectData changes (e.g. template loaded)
    useEffect(() => {
        if (projectData.content !== content) {
            setContent(projectData.content || '');
            if (editorRef.current) {
                // Determine if we need to update innerText. 
                // Only update if significantly different to avoid cursor jumping, or if we are sure it's an external update.
                // For simplicity here, we update if length is different or it's a template load scenario.
                if (editorRef.current.innerText !== projectData.content) {
                    editorRef.current.innerText = projectData.content || '';
                }
            }
        }
    }, [projectData.content]);

    // Sync local state to projectData
    useEffect(() => {
        const debounce = setTimeout(() => {
            if (content !== projectData.content) {
                updateProjectContent(content);
            }
        }, 1000);
        return () => clearTimeout(debounce);
    }, [content, updateProjectContent, projectData.content]);


    // Corrección en tiempo real
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (content.length > 5) {
                const correctionsResult = await corrector.current.analyze(content);
                setCorrections(correctionsResult);

                const result = await aiWriter.current.getSuggestions(content, {
                    mode: writingMode,
                    depth: 'detailed'
                });
                setSuggestions(result.improvements || result.suggestions || []);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [content, writingMode]);

    const handleVoiceInput = async () => {
        setIsListening(true);

        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');

                // Simple append strategy
                const newContent = content + ' ' + transcript;
                setContent(newContent);
                if (editorRef.current) {
                    editorRef.current.innerText = newContent;
                }
            };

            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert("Web Speech API not supported in this browser.");
            setIsListening(false);
        }
    };

    const handleAIAssist = async (type: 'expand' | 'improve' | 'summarize') => {
        if (type === 'expand') {
            const selection = window.getSelection()?.toString() || '';
            setSelectedContext(selection);
            setShowExpandirPanel(true);
            return;
        }

        setIsThinking(true);
        try {
            const aiResponse = await aiWriter.current.generateContent(content, {
                mode: writingMode,
                instruction: type,
                length: 'medium'
            });

            const newContent = content + '\n\n' + aiResponse.processed;
            setContent(newContent);
            if (editorRef.current) {
                editorRef.current.innerText = newContent;
            }
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleReadAloud = async () => {
        setVoiceActive(true);
        await voiceEngine.current.speak(content, {
            voiceType: selectedVoice,
            speed: voiceSpeed
        });
        // Mock duration reset
        setTimeout(() => setVoiceActive(false), Math.min(content.length * 100, 10000));
    };

    const handleTestVoice = async () => {
        await voiceEngine.current.speak("Hola, esta es una prueba de la voz seleccionada.", {
            voiceType: selectedVoice,
            speed: voiceSpeed
        });
    };

    const handleGenerateCover = () => {
        const title = projectData.title || "TITULO DEL LIBRO";
        const asciiArt = `Cover Generated for ${title}`;
        alert("Cover generated! Check console.");
        console.log(asciiArt);
    };

    const handleExportPDF = () => {
        alert("Exporting to PDF... (Simulated)");
    };

    const handleResearch = async () => {
        const selectedText = window.getSelection()?.toString();

        if (selectedText && selectedText.length > 5) {
            setIsThinking(true);
            try {
                const results = await researchEngine.current.researchContext(selectedText);
                setResearchPanel({
                    context: results.context,
                    sources: results.sources,
                    onInsert: (citation: any) => {
                        setContent(prev => {
                            const updated = prev + ` (${citation.apa})`;
                            if (editorRef.current) editorRef.current.innerText = updated;
                            return updated;
                        });
                        setResearchPanel(null);
                    }
                });
            } catch (error) {
                console.error("Research Error:", error);
            } finally {
                setIsThinking(false);
            }
        } else {
            alert("Selecciona texto para investigar");
        }
    };

    const applyCorrection = (correction: any) => {
        if (correction.type === 'Ortografía' && correction.suggestion.includes('mayúscula')) {
            const newContent = content.charAt(0).toUpperCase() + content.slice(1);
            setContent(newContent);
            if (editorRef.current) editorRef.current.innerText = newContent;
        } else if (correction.type === 'Gramática' && correction.suggestion.includes('punto')) {
            const newContent = content + '.';
            setContent(newContent);
            if (editorRef.current) editorRef.current.innerText = newContent;
        } else if (correction.type === 'Estilo' && correction.suggestion.includes('espacios')) {
            const newContent = content.replace(/  /g, ' ');
            setContent(newContent);
            if (editorRef.current) editorRef.current.innerText = newContent;
        }
        setCorrections(prev => prev.filter(c => c !== correction));
    };

    const useSuggestion = (suggestion: string) => {
        const newContent = content + '\n' + suggestion;
        setContent(newContent);
        if (editorRef.current) editorRef.current.innerText = newContent;
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Toolbar superior */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Modos de escritura */}
                    <select
                        value={writingMode}
                        onChange={(e) => setWritingMode(e.target.value as any)}
                        className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                    >
                        <option value="creative">🎨 Creativo</option>
                        <option value="professional">💼 Profesional</option>
                        <option value="technical">🔧 Técnico</option>
                        <option value="academic">🎓 Académico</option>
                    </select>

                    <div className="h-6 w-px bg-gray-700 mx-2"></div>

                    {/* Botones de voz */}
                    <button
                        onClick={handleVoiceInput}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isListening
                            ? 'bg-red-600 animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isListening ? '🎤 Escuchando...' : '🎤 Dictado'}
                    </button>

                    <button
                        onClick={handleReadAloud}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${voiceActive
                            ? 'bg-green-600'
                            : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                    >
                        🔊 {voiceActive ? 'Reproduciendo...' : 'Escuchar'}
                    </button>

                    <button
                        onClick={handleGenerateCover}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        🎨 Portada
                    </button>

                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        📤 PDF
                    </button>

                    <div className="h-6 w-px bg-gray-700 mx-2"></div>

                    {/* Asistencia IA */}
                    <div className="flex gap-2 items-center">
                        {isThinking && (
                            <div className="flex items-center gap-2 mr-2 text-xs text-blue-400 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                Thinking...
                            </div>
                        )}
                        <button
                            onClick={() => handleAIAssist('expand')}
                            disabled={isThinking}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50"
                        >
                            🤖 Expandir
                        </button>
                        <button
                            onClick={() => handleAIAssist('improve')}
                            disabled={isThinking}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50"
                        >
                            ✨ Mejorar
                        </button>
                        <button
                            onClick={() => handleAIAssist('summarize')}
                            disabled={isThinking}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50"
                        >
                            📝 Resumir
                        </button>
                        <button
                            onClick={handleResearch}
                            disabled={isThinking}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                            title="Investigar contexto actual (Ctrl+R)"
                        >
                            🔍 Investigar
                        </button>
                    </div>
                </div>
            </div>

            {/* Área principal */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <div
                            ref={editorRef}
                            contentEditable
                            className="min-h-[500px] p-8 bg-gray-800/30 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 prose prose-lg prose-invert max-w-none shadow-inner"
                            onInput={(e) => setContent(e.currentTarget.textContent || '')}
                            suppressContentEditableWarning
                            data-placeholder="Empieza a escribir tu obra maestra..."
                        >
                            {/* Initial content load is handled by useEffect on editorRef, but we can set defaultValue logic implicitly if needed. 
                                React warns on contentEditable with children managed by React. 
                                Here we rely on ref manipulation for updates to avoid cursor jumps. */}
                        </div>

                        {/* Panel de investigación (si hay resultados) */}
                        {researchPanel && (
                            <div className="mt-4 p-4 bg-gray-800/80 rounded-xl border border-amber-500/50 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-amber-400 font-semibold flex items-center gap-2">
                                        🔍 Resultados para: <span className="italic text-gray-300 text-sm">"{researchPanel.context}"</span>
                                    </h3>
                                    <button onClick={() => setResearchPanel(null)} className="text-gray-400 hover:text-white">✕</button>
                                </div>
                                <div className="space-y-3">
                                    {researchPanel.sources.map((source: any, i: number) => (
                                        <div key={i} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-colors">
                                            <p className="text-sm text-gray-300 mb-2">{source.apa}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => researchPanel.onInsert(source)}
                                                    className="px-3 py-1 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded text-xs hover:bg-amber-600/40 transition-colors"
                                                >
                                                    Insertar cita
                                                </button>
                                                <a
                                                    href={source.raw.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors"
                                                >
                                                    Ver fuente ↗
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Creative Assistant Panel */}
                        {showExpandirPanel && (
                            <ExpandirPanel
                                initialContext={selectedContext}
                                onClose={() => setShowExpandirPanel(false)}
                                onApplySuggestion={(suggestion) => {
                                    useSuggestion(suggestion.contenido);
                                    setShowExpandirPanel(false);
                                }}
                                onRequestMoreContext={() => {
                                    const selection = window.getSelection()?.toString() || '';
                                    if (selection) setSelectedContext(selection);
                                    else alert("Por favor seleccione texto en el editor primero.");
                                }}
                            />
                        )}

                        {/* Estadísticas en tiempo real */}
                        <div className="mt-6 grid grid-cols-4 gap-4">
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold">{content.length}</div>
                                <div className="text-sm text-gray-400">Caracteres</div>
                            </div>
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold">{content.trim() ? content.split(/\s+/).length : 0}</div>
                                <div className="text-sm text-gray-400">Palabras</div>
                            </div>
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold">{corrections.length}</div>
                                <div className="text-sm text-gray-400">Correcciones</div>
                            </div>
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold">{suggestions.length}</div>
                                <div className="text-sm text-gray-400">Sugerencias</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel lateral de IA */}
                <div className="w-80 border-l border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-auto hidden xl:block">
                    {/* Correcciones */}
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                            <span className="text-green-500">✓</span> Correcciones IA
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-auto">
                            {corrections.length === 0 && <p className="text-xs text-gray-500 italic">No hay correcciones.</p>}
                            {corrections.map((correction, index) => (
                                <div key={index} className="p-3 bg-gray-800/80 rounded-lg border border-gray-700">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">{correction.type}</span>
                                        <span className="text-xs text-gray-400">{correction.confidence}%</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{correction.suggestion}</p>
                                    <button
                                        onClick={() => applyCorrection(correction)}
                                        className="text-xs text-blue-400 mt-2 hover:text-blue-300"
                                    >
                                        Aplicar corrección →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sugerencias */}
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                            <span className="text-blue-500">💡</span> Sugerencias IA
                        </h3>
                        <div className="space-y-3">
                            {suggestions.slice(0, 5).map((suggestion, index) => (
                                <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <p className="text-sm mb-2 text-gray-300">{suggestion}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => useSuggestion(suggestion)}
                                            className="text-xs px-2 py-1 bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/50"
                                        >
                                            Usar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Voz en tiempo real */}
                    <div className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                            <span className="text-purple-500">🎤</span> Control de Voz
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs mb-2 text-gray-400">Voz</label>
                                <select
                                    className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-sm"
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                >
                                    <option value="human-male">Humano Masculino</option>
                                    <option value="human-female">Humano Femenino</option>
                                    <option value="ai-neutral">IA Neutral</option>
                                    <option value="storyteller">Narrador Profesional</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs mb-2 text-gray-400">Velocidad</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={voiceSpeed}
                                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-right text-xs text-gray-500">{voiceSpeed}x</div>
                            </div>
                            <button
                                onClick={handleTestVoice}
                                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-sm hover:opacity-90"
                            >
                                🔊 Probar Voz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
