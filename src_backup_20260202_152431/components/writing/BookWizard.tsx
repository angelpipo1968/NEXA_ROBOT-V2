'use client';

import { useState } from 'react';
import { Book, Wand2, ArrowRight, ArrowLeft, CheckCircle, Settings, FileText, Target, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookWizardProps {
    onBookCreated: (bookData: any) => void;
}

export function BookWizard({ onBookCreated }: BookWizardProps) {
    const [step, setStep] = useState(1);
    const [bookData, setBookData] = useState({
        title: '',
        genre: 'fiction',
        targetAudience: 'general',
        wordCount: 50000,
        language: 'en',
        description: ''
    });

    const genres = [
        'Ficcion', 'No-Ficcion', 'Ciencia Ficcion', 'Fantasia', 'Misterio',
        'Romance', 'Biografia', 'Autoayuda', 'Negocios', 'Tecnologia'
    ];

    const handleCreateBook = () => {
        // Logic to create book would go here
        console.log('Creating book:', bookData);

        // Pass data back to parent
        onBookCreated(bookData);
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <Book className="w-8 h-8 text-indigo-600" />
                    Nuevo Proyecto de Libro
                </h2>
                <p className="text-gray-500">Configura los detalles de tu próxima obra maestra con asistencia de IA.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[500px]">
                {/* Progress Bar */}
                <div className="bg-gray-50 border-b border-gray-100 p-4">
                    <div className="flex justify-between items-center max-w-2xl mx-auto relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 rounded-full"></div>
                        <div className={`absolute top-1/2 left-0 h-1 bg-indigo-600 -z-0 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${step >= stepNum
                                        ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white border-gray-200 text-gray-400'
                                    }`}>
                                    {step > stepNum ? <CheckCircle size={20} /> : <span className="font-bold">{stepNum}</span>}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step >= stepNum ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {stepNum === 1 ? 'Detalles' : stepNum === 2 ? 'Estructura' : 'Ajustes'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-white relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700 mb-1 block">Título del Libro</span>
                                        <input
                                            type="text"
                                            value={bookData.title}
                                            onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-lg font-medium placeholder:text-gray-400"
                                            placeholder="El nombre de tu historia..."
                                            autoFocus
                                        />
                                    </label>

                                    <div className="grid grid-cols-2 gap-6">
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700 mb-1 block">Género Literario</span>
                                            <div className="relative">
                                                <select
                                                    value={bookData.genre}
                                                    onChange={(e) => setBookData({ ...bookData, genre: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none transition-all"
                                                >
                                                    {genres.map(genre => (
                                                        <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <Type size={16} />
                                                </div>
                                            </div>
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700 mb-1 block">Objetivo de Palabras</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={bookData.wordCount}
                                                    onChange={(e) => setBookData({ ...bookData, wordCount: parseInt(e.target.value) })}
                                                    step="1000"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs font-bold uppercase">
                                                    Palabras
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700 mb-1 block">Descripción / Sinopsis</span>
                                        <textarea
                                            value={bookData.description}
                                            onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all h-32 resize-none"
                                            placeholder="Describe brevemente de qué trata tu libro..."
                                        />
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                        <Wand2 className="w-5 h-5 text-indigo-600" />
                                        Estructura Sugerida por IA
                                    </h4>
                                    <p className="text-indigo-700/80 text-sm mb-6">
                                        Basado en el género <span className="font-bold text-indigo-800">{bookData.genre}</span>, hemos preparado este esquema preliminar:
                                    </p>

                                    <div className="space-y-3">
                                        {['Introducción: El llamado', 'Capítulo 1: El Incidente', 'Capítulo 2: Desarrollo del Conflicto',
                                            'Capítulo 3: El Clímax', 'Capítulo 4: Resolución', 'Conclusión: Nuevo Comienzo'].map((chapter, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{chapter}</span>
                                                </div>
                                            ))}
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 flex items-center gap-1 transition-colors">
                                            <Wand2 size={14} /> Regenerar Estructura
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors shadow-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Asistencia Creativa</h4>
                                                <p className="text-sm text-gray-500">Sugerencias inteligentes mientras escribes</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors shadow-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Guardado en la Nube</h4>
                                                <p className="text-sm text-gray-500">Sincronización automática de tu progreso</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors shadow-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Settings size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Modo Focus</h4>
                                                <p className="text-sm text-gray-500">Interfaz minimalista para máxima concentración</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Anterior
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Siguiente <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateBook}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <Wand2 size={18} /> Crear Proyecto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
