"use client";

import React, { useState } from 'react';
import { useNexa, AISuggestion } from '@/context/NexaContext';
import { publishingRoadmap, publishingResources } from '@/data/publishingGuide';
import {
    Sparkles,
    BarChart2,
    BookOpen,
    Users,
    Palette,
    Wand2,
    Lightbulb,
    X,
    Mic,
    ExternalLink,
    ChevronRight,
    Globe
} from 'lucide-react';

export default function RightPanel() {
    const {
        projectData,
        aiSuggestions,
        removeSuggestion,
        updateProjectContent,
        updateTitle,
        applyTemplate,
        toggleListening,
        speakText,
        isListening,
        isSpeaking,
        showRightPanel,
        generateIdeas // Added generateIdeas to useNexa destructuring if it's available, otherwise we'll handle the empty state
    } = useNexa();

    const [activeTab, setActiveTab] = useState<'asistente' | 'datos' | 'publicar'>('asistente');

    if (!showRightPanel) return null;

    const handleAcceptSuggestion = (suggestion: AISuggestion, index: number) => {
        if (suggestion.action === 'use-title') {
            updateTitle(suggestion.content.replace(/["']/g, ''));
        } else if (suggestion.action === 'apply-style') {
            updateProjectContent(projectData.content + '\n\n[IA] ' + suggestion.content);
        } else if (suggestion.action === 'add-idea') {
            updateProjectContent(projectData.content + '\n\n[IDEA IA] ' + suggestion.content);
        } else {
            updateProjectContent(projectData.content + '\n\n[IA ADD] ' + suggestion.content);
        }
        removeSuggestion(index);
    };

    return (
        <aside className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] flex flex-col h-full transition-all duration-300">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('asistente')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'asistente' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Asistente
                </button>
                <button
                    onClick={() => setActiveTab('datos')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'datos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Stats
                </button>
                <button
                    onClick={() => setActiveTab('publicar')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'publicar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Publicar
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'asistente' && (
                    <div className="space-y-4">
                        {aiSuggestions.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <Sparkles size={40} className="mx-auto mb-2 text-indigo-400" />
                                <p>Solicita "Ideas" o "Refinar" para ver sugerencias aquí.</p>
                            </div>
                        )}
                        {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#222] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative group hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${suggestion.type === 'style' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                        suggestion.type === 'idea' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}>
                                        {suggestion.type}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">{suggestion.title}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    {suggestion.content}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptSuggestion(suggestion, index)}
                                        className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeSuggestion(index)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Plantillas Literarias moved here inside Asistente */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider mb-4">
                                <BookOpen size={14} /> Plantillas
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'novel', name: 'Novela', icon: 'book' },
                                    { id: 'thriller', name: 'Thriller', icon: 'wind' },
                                    { id: 'fantasy', name: 'Fantasía', icon: 'dragon' },
                                    { id: 'scifi', name: 'Sci-Fi', icon: 'rocket' },
                                ].map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => applyTemplate(template.id)}
                                        className="p-2 rounded bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#252525] border border-gray-100 dark:border-gray-800 text-left transition-colors"
                                    >
                                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{template.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'datos' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Palabras</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{projectData.stats.words.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Páginas</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{projectData.stats.pages}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Capítulos</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{projectData.stats.chapters}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lectura</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{Math.ceil(projectData.stats.words / 250)} min</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleListening}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'}`}
                            >
                                <Mic size={16} /> {isListening ? 'Escuchand...' : 'Dictar'}
                            </button>
                            <button
                                onClick={() => speakText(projectData.content)}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isSpeaking ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'}`}
                            >
                                <Users size={16} /> {isSpeaking ? 'Parar' : 'Leer'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'publicar' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-10">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg text-white mb-6">
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                <Globe size={18} /> Publicación Global
                            </h3>
                            <p className="text-xs text-indigo-100 opacity-90">
                                De tu borrador al mundo. Recursos profesionales seleccionados.
                            </p>
                        </div>

                        {/* Roadmap */}
                        <div className="space-y-3 mb-8">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Roadmap 3 Semanas</h4>
                            {publishingRoadmap.map((week, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-colors py-1">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#121212] border-2 border-gray-300 dark:border-gray-600 group-hover:border-indigo-500" />
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                        {week.title}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                                        {week.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Resources */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Plataformas y Editoriales</h4>
                            {publishingResources.map((category, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h5 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{category.category}</h5>
                                    {category.items.map((item, itemIdx) => (
                                        <a
                                            key={itemIdx}
                                            href={item.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block bg-gray-50 dark:bg-[#1a1a1a] hover:bg-white dark:hover:bg-[#222] border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 p-3 rounded-lg transition-all group relative overflow-hidden"
                                        >
                                            {item.badge && (
                                                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold shadow-sm">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                                        {item.name}
                                                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug pr-4">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors mt-2" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
