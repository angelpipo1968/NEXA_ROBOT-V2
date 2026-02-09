'use client';

import React, { useState, useEffect } from 'react';
import styles from './StudioLayout.module.css';
import {
    PenTool, Save, FileUp, Book, Layout, Mic, Settings,
    FileText, CheckCircle, Lightbulb,
    Search, BatteryCharging, Wand2, Image as ImageIcon
} from 'lucide-react';
import { Editor } from '@/components/writing/Editor';
import { VoiceStudio } from '@/components/voice/VoiceStudio';
import { BookWizard } from '@/components/writing/BookWizard';
import { DirectorMode } from '@/features/studio/modes/DirectorMode';

import { QuickStart } from '@/components/writing/QuickStart';
import { WritingTemplate } from '@/data/writing-templates';
import { useNexa } from '@/context/NexaContext';
import RightPanel from './layout/RightPanel';


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

type StudioView = 'editor' | 'library' | 'templates' | 'voice' | 'settings' | 'wizard' | 'vision';

export function ModernStudio() {
    const {
        projectData,
        updateProjectContent,
        aiSuggestions,
        toggleListening,
        isListening,
        generateIdeas // Assuming this exists or we trigger it via right panel
    } = useNexa();

    const [activeView, setActiveView] = useState<StudioView>('editor');

    // Use projectData from context instead of local state
    const content = projectData.content;
    const stats = projectData.stats;
    const activeBook = projectData.title ? { title: projectData.title } : null;

    const handleUseTemplate = (template: WritingTemplate) => {
        const newContent = `# ${template.title}\n## ${template.subtitle}\n\n${template.description}\n\n## Estructura Sugerida\n${template.structure.map(s => `- ${s}`).join('\n')}\n\n## Personajes\n${template.characters.map(c => `- ${c}`).join('\n')}\n\n## Consejos\n${template.tips}\n\n--- Empieza a escribir aquí ---`;
        updateProjectContent(newContent);
        setActiveView('editor');
    };

    const handleBookCreated = (book: any) => {
        // BookWizard inside context already handles creation, we just switch view or refresh
        // For now, assume BookWizardPanel handles the update
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
                                { id: 'vision', icon: ImageIcon, label: 'Vision Board' }, // NEW
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
                    <main className={styles.editorSection} style={{ padding: activeView === 'editor' ? '0' : '0' }}>
                        {activeView === 'editor' && (
                            <div className="h-full pt-6 px-5">
                                <Editor
                                    initialContent={content}
                                    bookId={projectData.id.toString() || 'draft'}
                                    onContentChange={updateProjectContent}
                                />
                            </div>
                        )}
                        {activeView === 'vision' && (
                            <div className="h-full w-full">
                                <DirectorMode />
                            </div>
                        )}
                        {activeView === 'voice' && <VoiceStudio />}
                        {activeView === 'wizard' && (
                            <div className="flex justify-center items-center h-full overflow-y-auto p-5">
                                <BookWizard onBookCreated={handleBookCreated} />
                            </div>
                        )}
                        {activeView === 'templates' && (
                            <div className="p-5 overflow-y-auto h-full">
                                <QuickStart onUseTemplate={handleUseTemplate} />
                            </div>
                        )}
                        {activeView === 'library' && <LibraryViewMock />}
                        {activeView === 'settings' && (
                            <div className="p-6">
                                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Configuración IA</h1>
                                <p className="text-gray-600 dark:text-gray-400">Ajustes del modelo y preferencias de generación.</p>
                            </div>
                        )}
                    </main>

                    {/* Right Stats & AI Assistant - Replaced with functional component */}
                    <div className="w-80 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
                        <RightPanel />
                    </div>
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
