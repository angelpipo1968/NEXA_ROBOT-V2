import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Loader2,
    BookOpen,
    Type,
    FileEdit,
    Wand2,
    Bot,
    Book,
    Layers,
    History,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { useStudioStore } from '@/lib/stores/useStudioStore';
import { museMemory } from '@/lib/museMemory';
import { BOOK_TEMPLATES, BookTemplate } from '@/lib/studio/BookTemplates';
import { AcousticEngine } from './features/AcousticEngine';
import { MuseChat } from './features/MuseChat';
import CharacterPanel from './layout/panels/CharacterPanel';
import { Users } from 'lucide-react';

interface BookStudioProps {
    onToggleZen: () => void;
}

export function BookStudio({ onToggleZen }: BookStudioProps) {
    const {
        writingTitle,
        setWritingTitle,
        chapters,
        setChapters,
        activeChapterId,
        setActiveChapterId,
        leftPanelWidth,
        setLeftPanelWidth
    } = useStudioStore();

    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isMuseOpen, setIsMuseOpen] = useState(false);
    const [leftTab, setLeftTab] = useState<'estructura' | 'personajes'>('estructura');

    // Ref for the main editor textarea to handle insertions
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

    // Autosave Logic
    useEffect(() => {
        setIsSaving(true);
        const timer = setTimeout(() => {
            museMemory.saveBookState(writingTitle, chapters, activeChapterId);
            setIsSaving(false);
            setLastSavedTime(new Date());
        }, 2000);

        return () => clearTimeout(timer);
    }, [writingTitle, chapters, activeChapterId]);

    const updateActiveChapterContent = (newContent: string) => {
        setChapters(chapters.map(c =>
            c.id === activeChapterId ? { ...c, content: newContent } : c
        ));
    };

    const updateActiveChapterTitle = (newTitle: string) => {
        setChapters(chapters.map(c =>
            c.id === activeChapterId ? { ...c, title: newTitle } : c
        ));
    };

    const addNewChapter = () => {
        const newChapter = {
            id: Date.now().toString(),
            title: `Capítulo ${chapters.length + 1}`,
            content: ''
        };
        setChapters([...chapters, newChapter]);
        setActiveChapterId(newChapter.id);
    };

    const deleteChapter = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (chapters.length <= 1) return;
        if (window.confirm('¿Eliminar capítulo?')) {
            const newChapters = chapters.filter(c => c.id !== id);
            setChapters(newChapters);
            if (activeChapterId === id) {
                setActiveChapterId(newChapters[0].id);
            }
        }
    };

    const moveChapter = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newChapters = [...chapters];
        if (direction === 'up' && index > 0) {
            [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
        } else if (direction === 'down' && index < chapters.length - 1) {
            [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
        }
        setChapters(newChapters);
    };

    const applyTemplate = (template: BookTemplate) => {
        if (chapters.some(c => c.content.trim().length > 0)) {
            if (!window.confirm('¿Estás seguro? Al aplicar una plantilla se reemplazará todo el contenido actual del libro.')) {
                return;
            }
        }

        setSelectedTemplate(template);
        setWritingTitle(template.name);
        setChapters([{ id: '1', title: 'Comienzo', content: template.structure }]);
        setActiveChapterId('1');
    };

    // AI Insertion Logic
    const handleInsertContent = (text: string) => {
        if (!editorRef.current) return;

        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = activeChapter.content;

        const newText = currentText.substring(0, start) + text + currentText.substring(end);

        updateActiveChapterContent(newText);

        // Restore focus and cursor position after insertion
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + text.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Resize Logic
    const startResizing = (e: React.MouseEvent) => {
        setIsResizing(true);
        const startX = e.clientX;
        const startWidth = leftPanelWidth;

        const doDrag = (dragEvent: MouseEvent) => {
            const newWidth = startWidth + (dragEvent.clientX - startX);
            if (newWidth > 280 && newWidth < 600) {
                setLeftPanelWidth(newWidth);
            }
        };

        const stopDrag = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.body.style.cursor = 'col-resize';
    };

    return (
        <div className="flex-1 flex bg-[var(--bg-primary)] h-full overflow-hidden relative">
            {/* LEFT SIDEBAR: Structure & Tools */}
            <div
                className="flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] relative group/sidebar"
                style={{ width: leftPanelWidth }}
            >
                {/* Book Meta */}
                <div className="p-6 border-b border-[var(--border-color)] space-y-4">
                    <input
                        type="text"
                        value={writingTitle}
                        onChange={(e) => setWritingTitle(e.target.value)}
                        placeholder="Título del Libro..."
                        className="w-full bg-transparent text-2xl font-bold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setLeftTab('estructura')}
                            className={`flex-1 py-2 px-3 hover:bg-white/10 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${leftTab === 'estructura' ? 'bg-[var(--vp-accent-purple)]/20 border-[var(--vp-accent-purple)] text-[var(--vp-accent-purple)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                        >
                            <BookOpen size={14} /> Estructura
                        </button>
                        <button
                            onClick={() => setLeftTab('personajes')}
                            className={`flex-1 py-2 px-3 hover:bg-white/10 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${leftTab === 'personajes' ? 'bg-[var(--vp-accent-purple)]/20 border-[var(--vp-accent-purple)] text-[var(--vp-accent-purple)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                        >
                            <Users size={14} /> Personajes
                        </button>
                    </div>
                </div>

                {/* Left Panel Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {leftTab === 'personajes' ? (
                        <CharacterPanel />
                    ) : (
                        <div className="space-y-6">
                            {/* Templates Section */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                                    <Wand2 size={12} /> Plantillas Maestras
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {BOOK_TEMPLATES.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplate(template)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedTemplate?.id === template.id
                                                ? 'bg-[var(--vp-accent-purple)]/10 border-[var(--vp-accent-purple)] text-[var(--vp-accent-purple)]'
                                                : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--text-muted)] text-[var(--text-secondary)]'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{template.icon}</div>
                                            <div className="font-bold text-xs truncate">{template.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chapters List */}
                            <div>
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                                        <Layers size={12} /> Capítulos
                                    </h3>
                                    <button onClick={addNewChapter} className="p-1 hover:bg-white/10 rounded-lg text-[var(--text-secondary)]">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {chapters.map((chapter, index) => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => setActiveChapterId(chapter.id)}
                                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${activeChapterId === chapter.id
                                                ? 'bg-[var(--vp-accent-purple)] text-white border-[var(--vp-accent-purple)] shadow-lg shadow-purple-500/20'
                                                : 'hover:bg-white/5 text-[var(--text-secondary)] border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Book size={14} className={activeChapterId === chapter.id ? 'text-white' : 'text-[var(--text-muted)]'} />
                                                <span className="text-sm font-medium truncate">{chapter.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => moveChapter(index, 'up', e)}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                                >
                                                    <ArrowUp size={10} />
                                                </button>
                                                <button
                                                    onClick={(e) => moveChapter(index, 'down', e)}
                                                    disabled={index === chapters.length - 1}
                                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                                >
                                                    <ArrowDown size={10} />
                                                </button>
                                                <button
                                                    onClick={(e) => deleteChapter(chapter.id, e)}
                                                    className={`p-1 rounded hover:bg-red-500/20 hover:text-red-500 transition-all ${activeChapterId === chapter.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Tools */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-4">
                    <AcousticEngine />

                    {/* Stats & Save */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--bg-tertiary)] p-3 rounded-2xl border border-[var(--border-color)]">
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{activeChapter.content.split(/\s+/).filter(Boolean).length}</p>
                            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Palabras</p>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] p-3 rounded-2xl border border-[var(--border-color)]">
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{activeChapter.content.length}</p>
                            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Caracteres</p>
                        </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--border-color)] transition-all text-sm font-bold text-[var(--text-secondary)] hover:bg-white/5">
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span className="truncate">Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span className="truncate">
                                    {lastSavedTime ? `Guardado ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-guardado'}
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Resize Handle */}
                <div
                    onMouseDown={startResizing}
                    className="absolute right-[-12px] top-0 bottom-0 w-6 z-50 cursor-col-resize flex flex-col justify-center items-center group/handle opacity-0 group-hover/sidebar:opacity-100 transition-opacity hover:opacity-100"
                >
                    <div className="w-1 h-32 bg-[var(--text-muted)] rounded-full group-hover/handle:bg-[var(--vp-accent-purple)] transition-colors" />
                </div>
            </div>

            {/* MAIN EDITOR AREA */}
            <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto px-[15%] py-12 scroll-smooth">
                    <input
                        type="text"
                        value={activeChapter.title}
                        onChange={(e) => updateActiveChapterTitle(e.target.value)}
                        className="w-full text-4xl font-bold bg-transparent text-[var(--text-primary)] mb-8 focus:outline-none border-b border-transparent focus:border-[var(--border-color)] transition-all pb-2 placeholder:text-[var(--text-muted)]/30"
                        placeholder="Título del Capítulo..."
                    />
                    <textarea
                        ref={editorRef}
                        value={activeChapter.content}
                        onChange={(e) => updateActiveChapterContent(e.target.value)}
                        placeholder="Empieza a escribir tu historia..."
                        className="w-full min-h-[800px] bg-transparent text-lg leading-relaxed text-[var(--text-primary)] resize-none focus:outline-none font-serif placeholder:text-[var(--text-muted)]/20 selection:bg-[var(--vp-accent-purple)]/30"
                        spellCheck={false}
                    />
                </div>

                {/* Floating Action Button (FAB) for Muse */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMuseOpen(!isMuseOpen)}
                    className="absolute bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[var(--vp-accent-purple)] to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white z-40 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-shadow"
                >
                    <Bot size={28} />
                </motion.button>

                {/* Muse Chat Overlay */}
                {isMuseOpen && (
                    <MuseChat
                        isOpen={isMuseOpen}
                        onClose={() => setIsMuseOpen(false)}
                        currentChapterContent={activeChapter.content}
                        chapterTitle={activeChapter.title}
                        bookTitle={writingTitle}
                        onInsertContent={handleInsertContent}
                    />
                )}
            </div>
        </div>
    );
}
