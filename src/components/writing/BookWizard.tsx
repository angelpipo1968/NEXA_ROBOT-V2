'use client';

import React, { useState } from 'react';
import { Book, Sparkles } from 'lucide-react';

interface BookWizardProps {
    onBookCreated: () => void;
}

export function BookWizard({ onBookCreated }: BookWizardProps) {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('novela');

    const handleCreate = () => {
        if (title.trim()) {
            onBookCreated();
        }
    };

    return (
        <div className="max-w-lg w-full mx-auto p-8 bg-white/5 rounded-2xl border border-white/10 space-y-6">
            <div className="text-center space-y-2">
                <Book size={48} className="mx-auto text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Crear Nuevo Libro</h2>
                <p className="text-sm text-gray-400">Comienza tu próxima obra maestra</p>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título del libro..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
                <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                    <option value="novela">📖 Novela</option>
                    <option value="cuento">📝 Cuento</option>
                    <option value="ensayo">🎓 Ensayo</option>
                    <option value="poesia">🌹 Poesía</option>
                    <option value="guion">🎬 Guión</option>
                </select>
                <button
                    onClick={handleCreate}
                    disabled={!title.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles size={18} />
                    Crear Libro
                </button>
            </div>
        </div>
    );
}

export default BookWizard;
