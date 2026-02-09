"use client";

import React from 'react';
import { useNexa } from '../../context/NexaContext';
import Sidebar from './Sidebar';
import MainHeader from './MainHeader';
import RightPanel from './RightPanel';
import FloatingAI from './FloatingAI';

// Panels
// Panels
import EditorPanel from './panels/EditorPanel';
import LibraryPanel from './panels/LibraryPanel';
import SettingsPanel from './panels/SettingsPanel'; // Re-using existing, styling might need tweak
import TemplatesPanel from './panels/TemplatesPanel';
import VoicePanel from './panels/VoicePanel';
import BookWizardPanel from './panels/BookWizardPanel';

export default function NexaStudioLayout() {
    const { activePanel } = useNexa();

    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <MainHeader />

                {/* Dynamic Content Area */}
                {activePanel === 'editor' && <EditorPanel />}
                {activePanel === 'biblioteca' && <LibraryPanel />}
                {activePanel === 'configuracion' && <SettingsPanel />}
                {activePanel === 'plantillas' && <TemplatesPanel />}
                {activePanel === 'voz' && <VoicePanel />}
                {activePanel === 'nuevo-libro' && <BookWizardPanel />}

                {/* Placeholder for others */}
                {activePanel === 'ia' && (
                    <div className="editor-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                        <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                        <h2>Panel de Investigación</h2>
                        <p>Próximamente: Motor de Búsqueda Semántica Avanzada</p>
                    </div>
                )}
            </main>

            <RightPanel />
            <FloatingAI />
        </div>
    );
}
