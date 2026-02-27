import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { useVoiceStore } from '@/store/voiceStore';
"use client";

import React from 'react';


export default function Sidebar() {
        const { createNewProject, saveProject } = useProjectStore();
    const { activePanel, switchPanel } = useUiStore();
    const { isSpeaking } = useVoiceStore();

    return (
        <aside className="sidebar">
            <div className="logo">
                <div className="logo-icon">
                    <i className="fas fa-book-open"></i>
                </div>
                <div className="logo-text">
                    <h1>NEXA BOOK</h1>
                    <p>Studio Literario</p>
                </div>
            </div>

            <div className="nav-section">
                <div className="nav-item">
                    <a className={`nav-link ${activePanel === 'editor' ? 'active' : ''}`} onClick={() => switchPanel('editor')}>
                        <i className="fas fa-feather-alt"></i>
                        <span>Editor de Libro</span>
                    </a>
                </div>
                <div className="nav-item">
                    <a className={`nav-link ${activePanel === 'plantillas' ? 'active' : ''}`} onClick={() => switchPanel('plantillas')}>
                        <i className="fas fa-layer-group"></i>
                        <span>Plantillas</span>
                    </a>
                </div>
                <div className="nav-item">
                    <a className={`nav-link ${activePanel === 'configuracion' ? 'active' : ''}`} onClick={() => switchPanel('configuracion')}>
                        <i className="fas fa-th-list"></i>
                        <span>Estructura</span>
                    </a>
                </div>
                <div className="nav-item">
                    <a className={`nav-link ${activePanel === 'ia' ? 'active' : ''}`} onClick={() => switchPanel('ia')}>
                        <i className="fas fa-search"></i>
                        <span>Investigación</span>
                    </a>
                </div>
            </div>

            <div className="nav-section" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <div className="nav-item">
                    <a className="nav-link" onClick={() => switchPanel('nuevo-libro')}>
                        <i className="fas fa-plus-circle"></i>
                        <span>Nuevo Libro</span>
                    </a>
                </div>
                <div className="nav-item">
                    <a className="nav-link" onClick={saveProject} style={{ color: 'var(--primary)' }}>
                        <i className="fas fa-save"></i>
                        <span>Guardar Libro</span>
                    </a>
                </div>
                <div className="nav-item">
                    <a className="nav-link">
                        <i className="fas fa-file-pdf"></i>
                        <span>Exportar PDF</span>
                    </a>
                </div>
            </div>

            <div className="ai-avatar-container">
                <div className={`ai-avatar ${isSpeaking ? 'speaking' : ''}`} id="aiAvatar">
                    <i className="fas fa-robot"></i>
                </div>
                <div className="ai-name">NEXA LITERIS</div>
                <div className="ai-status">
                    <span className="status-dot"></span>
                    <span>IA Literaria Activa</span>
                </div>
            </div>
        </aside>
    );
}
