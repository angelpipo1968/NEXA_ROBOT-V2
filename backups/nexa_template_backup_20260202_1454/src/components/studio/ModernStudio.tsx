'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from '../../app/studio/StudioLayout.module.css';
import {
    PenTool, Save, FileUp, Book, Layout, Mic, Settings,
    FileText, CheckCircle, Lightbulb,
    Search, BatteryCharging
} from 'lucide-react';
import { Editor } from '../writing/Editor';
import { VoiceStudio } from '../voice/VoiceStudio';
import { BookWizard } from '../writing/BookWizard';
import { QuickStart } from '../writing/QuickStart';
import { WritingTemplate } from '../../data/writing-templates';

// --- Mocked Subcomponents ---
const LibraryViewMock = () => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Biblioteca</h2>
        <p className="text-gray-500 dark:text-gray-400">Gestión de proyectos</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Proyecto Alpha</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última edición hace 2h</p>
            </div>
            <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Memorias 2024</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completado</p>
            </div>
        </div>
    </div>
);

type StudioView = 'editor' | 'library' | 'templates' | 'voice' | 'settings' | 'wizard';

export function ModernStudio() {
    const [activeView, setActiveView] = useState<StudioView>('editor');
    const [content, setContent] = useState<string>('');
    const [stats, setStats] = useState({ chars: 0, words: 0, corrections: 0, suggestions: 4 });
    const [activeBook, setActiveBook] = useState<any>(null);

    // Effect to update stats
    useEffect(() => {
        const words = content.trim() ? content.split(/\s+/).length : 0;
        const chars = content.length;
        setStats(prev => ({ ...prev, words, chars }));
    }, [content]);

    const handleUseTemplate = (template: WritingTemplate) => {
        const newContent = `# ${template.title}\n## ${template.subtitle}\n\n${template.description}\n\n## Estructura Sugerida\n${template.structure.map(s => `- ${s}`).join('\n')}\n\n## Personajes\n${template.characters.map(c => `- ${c}`).join('\n')}\n\n## Consejos\n${template.tips}\n\n--- Empieza a escribir aquí ---`;
        setContent(newContent);
        setActiveView('editor');
    };

    const handleBookCreated = (book: any) => {
        setActiveBook(book);
        setContent(`# ${book.title}\n## ${book.description}\n\n${book.genre.toUpperCase()} - ${book.wordCount} words target\n\nStarting...`);
        setActiveView('editor');
    };

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                {/* Premium Header */}
                <header className="h-14 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#0a0a0a] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <span className="text-white dark:text-black text-xl font-black italic">N</span>
                        </div>
                        <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                            studio <span className="text-gray-400 font-medium lowercase">/ {activeBook?.title || 'mi proyecto'}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </header>

                <div className={styles.mainLayout}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <h2 className={styles.sectionTitle}>
                            <PenTool size={16} className={styles.sectionTitleIcon} /> Studio
                        </h2>
                        <nav className="flex flex-col gap-1">
                            {[
                                { id: 'editor', icon: PenTool, label: 'Editor' },
                                { id: 'library', icon: Book, label: 'Biblioteca' },
                                { id: 'templates', icon: Layout, label: 'Plantillas' },
                                { id: 'wizard', icon: FileText, label: 'Nuevo Libro' },
                                { id: 'voice', icon: Mic, label: 'Voz' },
                                { id: 'settings', icon: Settings, label: 'Configuración' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    className={`${styles.btn} ${activeView === item.id ? styles.btnActive : ''}`}
                                    onClick={() => setActiveView(item.id as StudioView)}
                                >
                                    <item.icon size={16} /> {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button className={`${styles.btn} ${styles.btnPrimary} w-full mb-2`}>
                                <Save size={16} /> Guardar
                            </button>
                            <button className={`${styles.btn} ${styles.btnOutline} w-full`}>
                                <FileUp size={16} /> Exportar
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className={styles.editorSection} style={{ padding: activeView === 'editor' ? '0' : '20px' }}>
                        {activeView === 'editor' && (
                            <div className="h-full pt-6">
                                <Editor
                                    initialContent={content}
                                    bookId={activeBook?.id || 'draft'}
                                    onContentChange={setContent}
                                />
                            </div>
                        )}
                        {activeView === 'voice' && <VoiceStudio />}
                        {activeView === 'wizard' && (
                            <div className="flex justify-center items-center h-full overflow-y-auto">
                                <BookWizard onBookCreated={handleBookCreated} />
                            </div>
                        )}
                        {activeView === 'templates' && (
                            <QuickStart onUseTemplate={handleUseTemplate} />
                        )}
                        {activeView === 'library' && <LibraryViewMock />}
                        {activeView === 'settings' && (
                            <div className="p-6">
                                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Configuración IA</h1>
                                <p className="text-gray-600 dark:text-gray-400">Ajustes del modelo y preferencias de generación.</p>
                            </div>
                        )}
                    </main>

                    {/* Right Stats */}
                    <aside className={styles.statsSection}>
                        <h2 className={styles.sectionTitle}>
                            <BatteryCharging size={16} className={styles.sectionTitleIcon} /> Stats
                        </h2>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.chars}</div>
                                <div className={styles.statLabel}>Caracteres</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.words}</div>
                                <div className={styles.statLabel}>Palabras</div>
                            </div>
                        </div>

                        <div className={styles.aiSection + " mt-6"}>
                            <h3 className={styles.aiTitle}>
                                <CheckCircle size={16} className={styles.aiTitleIcon} /> Sugerencias
                            </h3>
                            <div className={styles.aiItem}>
                                <Lightbulb size={14} className={styles.aiItemIcon + " text-yellow-500"} />
                                <span>Optimiza el ritmo del primer capítulo</span>
                            </div>
                            <div className={styles.aiItem}>
                                <Search size={14} className={styles.aiItemIcon} />
                                <span>Detectado estilo: Narrativo</span>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer className={styles.footer}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Nexa Studio Pro · Engine v3.0 · 2026
                    </p>
                </footer>
            </div>
        </div>
    );
}
