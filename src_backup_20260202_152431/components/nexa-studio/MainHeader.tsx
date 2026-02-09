"use client";

import React from 'react';
import { useNexa } from '../../context/NexaContext';

export default function MainHeader() {
    const { projectData } = useNexa();

    return (
        <header className="main-header">
            <div className="header-title">
                <h1 id="bookTitle">{projectData.title}</h1>
                <p id="bookSubtitle">Escribe, corrige y publica con inteligencia artificial avanzada</p>
            </div>
            <div className="header-actions">
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 25px', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-moon" style={{ marginRight: '8px' }}></i>
                    Modo Nocturno • Enfoque Total
                </div>
            </div>
        </header>
    );
}
