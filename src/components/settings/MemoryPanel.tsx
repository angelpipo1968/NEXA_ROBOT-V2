import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Brain, Search, Clock, ShieldCheck, X } from 'lucide-react';

interface MemoryItem {
    id: string;
    content: string;
    timestamp: Date;
    category?: string;
}

export function MemoryPanel() {
    const [memories, setMemories] = useState<MemoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        // Load memories from localStorage for now
        const saved = localStorage.getItem('nexa-memories');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMemories(parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
            } catch (e) {
                console.error("Failed to parse memories", e);
            }
        } else {
            // Mock data if empty
            const mock: MemoryItem[] = [
                { id: '1', content: 'Prefiere un tono formal y profesional.', timestamp: new Date(), category: 'Preferencia' },
                { id: '2', content: 'Trabaja en un proyecto llamado NEXA OS.', timestamp: new Date(), category: 'Contexto' },
                { id: '3', content: 'Usa React y Tailwind para el frontend.', timestamp: new Date(), category: 'Técnico' }
            ];
            setMemories(mock);
            localStorage.setItem('nexa-memories', JSON.stringify(mock));
        }
    }, []);

    const handleDelete = (id: string) => {
        const updated = memories.filter(m => m.id !== id);
        setMemories(updated);
        localStorage.setItem('nexa-memories', JSON.stringify(updated));
        setIsDeleting(null);
    };

    const filteredMemories = memories.filter(m =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header Info */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--vp-accent-purple)]/10 border border-[var(--vp-accent-purple)]/20 flex items-start gap-4">
                <Brain className="text-[var(--vp-accent-purple)] shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">Gestión de Memoria</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Aquí puedes ver lo que NEXA ha aprendido sobre ti. Estos datos ayudan a personalizar tus respuestas.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                    type="text"
                    placeholder="Buscar en la memoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--vp-accent-purple)] transition-all text-[var(--text-primary)]"
                />
            </div>

            {/* Memory List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                    {filteredMemories.length > 0 ? (
                        filteredMemories.map((memory) => (
                            <motion.div
                                key={memory.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-lg)] group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {memory.category && (
                                                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--vp-accent-purple)] text-[10px] font-bold uppercase tracking-wider">
                                                    {memory.category}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-medium uppercase">
                                                <Clock size={10} />
                                                {memory.timestamp.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                                            {memory.content}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setIsDeleting(memory.id)}
                                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Confirmation Overlay */}
                                <AnimatePresence>
                                    {isDeleting === memory.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-red-500/95 backdrop-blur-sm flex items-center justify-center gap-4 z-10"
                                        >
                                            <span className="text-white font-bold text-sm">¿Eliminar este recuerdo?</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDelete(memory.id)}
                                                    className="px-3 py-1 bg-white text-red-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    onClick={() => setIsDeleting(null)}
                                                    className="px-3 py-1 bg-black/20 text-white rounded-lg text-xs font-bold hover:bg-black/30 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Brain size={48} className="mx-auto mb-4 opacity-10" />
                            <p>No se encontraron recuerdos.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center gap-2 text-[var(--text-muted)]">
                <ShieldCheck size={14} />
                <span className="text-xs">Tu memoria está cifrada localmente y nunca se vende.</span>
            </div>
        </div>
    );
}
