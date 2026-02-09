'use client';

import { useState } from 'react';
import { WRITING_TEMPLATES, WritingTemplate } from '../../data/writing-templates';
import {
    Wand2, Search, BookOpen, User,
    CheckCircle, X, Sparkles, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const GenreMap: { [key: string]: string } = {
    'fantasia': 'Fantasía',
    'misterio': 'Misterio',
    'ciencia-ficcion': 'Ciencia Ficción',
    'novela': 'Novela',
    'no-ficcion': 'No Ficción',
    'negocios': 'Negocios',
    'academico': 'Académico',
    'poesia': 'Poesía',
    'guion': 'Guion / Teatro',
    'otros': 'Otros'
};

interface QuickStartProps {
    onUseTemplate?: (template: WritingTemplate) => void;
}

export const QuickStart: React.FC<QuickStartProps> = ({ onUseTemplate }) => {
    const [filter, setFilter] = useState('all');
    const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = WRITING_TEMPLATES.filter(t => {
        const matchesFilter = filter === 'all' || t.genre === filter;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleUseTemplate = (t: WritingTemplate) => {
        if (onUseTemplate) {
            onUseTemplate(t);
        } else {
            // Fallback for standalone usage
            const message = `¡Proyecto creado para: ${t.title}!\n\nSe han configurado ${t.chapters} capítulos y la estructura de ${GenreMap[t.genre]}.`;
            alert(message);
        }
        console.log('Using template:', t);
    };

    return (
        <div className="min-h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 p-6 md:p-10 font-sans text-slate-900 dark:text-slate-100">

            {/* Header */}
            <header className="text-center mb-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 pb-2">
                        Biblioteca de Plantillas
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        15 estructuras profesionales para comenzar tu próxima obra maestra.
                        Desde fantasía épica hasta thrillers psicológicos.
                    </p>
                </motion.div>

                {/* Search & Filter */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap">
                    <div className="relative group w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar plantillas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar px-2">
                        {[
                            { id: 'all', label: 'Todas' },
                            { id: 'novela', label: 'Novelas' },
                            { id: 'fantasia', label: 'Fantasía' },
                            { id: 'ciencia-ficcion', label: 'Sci-Fi' },
                            { id: 'misterio', label: 'Misterio' },
                            { id: 'all', label: 'Todas' },
                            { id: 'novela', label: 'Novelas' },
                            { id: 'fantasia', label: 'Fantasía' },
                            { id: 'ciencia-ficcion', label: 'Sci-Fi' },
                            { id: 'misterio', label: 'Misterio' },
                            { id: 'guion', label: 'Guiones' },
                            { id: 'no-ficcion', label: 'No Ficción' },
                            { id: 'negocios', label: 'Negocios' },
                            { id: 'academico', label: 'Académico' },
                            { id: 'poesia', label: 'Poesía' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${filter === f.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md transform scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
                <AnimatePresence>
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                            <motion.div
                                layout
                                initial={{ opacity: 1, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={template.id}
                                className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col h-full backdrop-blur-sm"
                                onClick={() => setSelectedTemplate(template)}
                            >
                                {/* Card Header */}
                                <div className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-600">
                                            {GenreMap[template.genre] || template.genre}
                                        </span>
                                    </div>

                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <i className={`${template.iconClass} text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400`}></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                        {template.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {template.subtitle}
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 pt-2 flex-1 flex flex-col">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed">
                                        {template.description}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                {template.chapters}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Caps</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm truncate" title={template.words}>
                                                {template.words.split('-')[0]}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Words</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm truncate" title={template.time}>
                                                {template.time.split(' ')[0]}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Months</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <button
                                            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                            onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                                        >
                                            <Eye className="w-4 h-4" /> Preview
                                        </button>
                                        <button
                                            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                                        >
                                            <User className="w-4 h-4" /> Use
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <h3 className="text-xl font-bold text-slate-500">No se encontraron plantillas.</h3>
                            <p className="text-slate-400">Intenta ajustar los filtros o la búsqueda.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedTemplate(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex justify-between items-start shrink-0">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
                                        <i className={`${selectedTemplate.iconClass} text-white`}></i>
                                    </div>
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2 backdrop-blur-sm">
                                            {GenreMap[selectedTemplate.genre]}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-1">{selectedTemplate.title}</h2>
                                        <p className="text-indigo-100/90 text-sm md:text-base">{selectedTemplate.subtitle}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                                    {/* Left Column: Stats & Structure */}
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Palabras</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTemplate.words}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Capítulos</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTemplate.chapters}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Tiempo</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTemplate.time}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                Estructura Sugerida
                                            </h3>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                                <ul className="space-y-3">
                                                    {selectedTemplate.structure.map((item, idx) => (
                                                        <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                                                                {idx + 1}
                                                            </span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Characters & Features */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                                    <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                </div>
                                                Personajes Arquetípicos
                                            </h3>
                                            <ul className="space-y-3">
                                                {selectedTemplate.characters.map((char, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                        <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">{char}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                Características Clave
                                            </h3>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {selectedTemplate.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
                                            <h4 className="text-amber-800 dark:text-amber-200 font-bold text-sm mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Consejo Pro
                                            </h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-300/80 italic">
                                                "{selectedTemplate.tips}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => { handleUseTemplate(selectedTemplate); setSelectedTemplate(null); }}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all flex items-center gap-2"
                                >
                                    <Wand2 className="w-5 h-5" />
                                    Usar Plantilla
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
