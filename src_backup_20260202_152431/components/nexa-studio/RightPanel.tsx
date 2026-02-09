"use client";

import React from 'react';
import { useNexa, AISuggestion } from '../../context/NexaContext';

export default function RightPanel() {
    const {
        projectData,
        aiSuggestions,
        removeSuggestion,
        updateProjectContent,
        updateTitle,
        applyTemplate,
        toggleListening,
        speakText,
        isListening,
        isSpeaking,
        showRightPanel
    } = useNexa();

    if (!showRightPanel) return null;

    const handleAcceptSuggestion = (suggestion: AISuggestion, index: number) => {
        if (suggestion.action === 'use-title') {
            updateTitle(suggestion.content.replace(/["']/g, ''));
        } else if (suggestion.action === 'apply-style') {
            updateProjectContent(projectData.content + '\n\n[IA] ' + suggestion.content);
        } else if (suggestion.action === 'add-idea') {
            updateProjectContent(projectData.content + '\n\n[IDEA IA] ' + suggestion.content);
        } else {
            updateProjectContent(projectData.content + '\n\n[IA ADD] ' + suggestion.content);
        }
        removeSuggestion(index);
    };

    return (
        <aside className="right-panel">
            {/* STATS SECTION */}
            <div className="panel-section">
                <div className="panel-title">
                    <i className="fas fa-chart-line"></i>
                    <h3>Estadísticas del Libro</h3>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{projectData.stats.words.toLocaleString()}</div>
                        <div className="stat-label">Palabras</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{projectData.stats.chars.toLocaleString()}</div>
                        <div className="stat-label">Caracteres</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{projectData.stats.chapters}</div>
                        <div className="stat-label">Capítulos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{projectData.stats.pages}</div>
                        <div className="stat-label">Páginas Est.</div>
                    </div>
                </div>

                <div className="voice-controls">
                    <button
                        className={`voice-btn listen ${isListening ? 'recording' : ''}`}
                        onClick={toggleListening}
                        title="Dictado por voz"
                    >
                        <i className="fas fa-microphone-alt"></i>
                    </button>
                    <button
                        className={`voice-btn speak ${isSpeaking ? 'active' : ''}`}
                        onClick={() => speakText(projectData.content)}
                        title="Leer en voz alta"
                    >
                        <i className={`fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'}`}></i>
                    </button>
                </div>
            </div>

            {/* AI SUGGESTIONS SECTION */}
            <div className="panel-section">
                <div className="panel-title">
                    <i className="fas fa-robot"></i>
                    <h3>Sugerencias IA Literaria</h3>
                </div>
                <div className="ai-suggestions">
                    {aiSuggestions.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                            Generando ideas... (Usa el botón "Ideas Creativas")
                        </p>
                    )}
                    {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-card">
                            <div className="suggestion-title">
                                <i className={`fas fa-${suggestion.type === 'title' ? 'heading' :
                                        suggestion.type === 'style' ? 'pen-fancy' :
                                            suggestion.type === 'idea' ? 'bolt' :
                                                suggestion.type === 'character' ? 'user' : 'comment'
                                    }`}></i>
                                <span>{suggestion.title}</span>
                            </div>
                            <div className="suggestion-content">{suggestion.content}</div>
                            <div className="suggestion-actions">
                                <button className="suggestion-btn accept" onClick={() => handleAcceptSuggestion(suggestion, index)}>Aplicar</button>
                                <button className="suggestion-btn reject" onClick={() => removeSuggestion(index)}>Ignorar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TEMPLATES GRID */}
            <div className="panel-section">
                <div className="panel-title">
                    <i className="fas fa-layer-group"></i>
                    <h3>Plantillas Literarias</h3>
                </div>
                <div className="templates-grid">
                    {[
                        { id: 'novel', name: 'Novela Ficción', icon: 'book', desc: 'Arco narrativo clásico' },
                        { id: 'thriller', name: 'Thriller', icon: 'wind', desc: 'Ritmo acelerado' },
                        { id: 'fantasy', name: 'Fantasía Épica', icon: 'dragon', desc: 'Mundos mágicos' },
                        { id: 'scifi', name: 'Ciencia Ficción', icon: 'rocket', desc: 'Futuro y espacio' },
                        { id: 'romance', name: 'Romance', icon: 'heart', desc: 'Desarrollo emocional' },
                        { id: 'memoir', name: 'Memorias', icon: 'user', desc: 'Narrativa personal' },
                        { id: 'poetry', name: 'Poesía', icon: 'feather', desc: 'Verso y ritmo' },
                        { id: 'nonfiction', name: 'No Ficción', icon: 'brain', desc: 'Argumentos reales' },
                        { id: 'children', name: 'Infantil', icon: 'child', desc: 'Cuentos' },
                        { id: 'short', name: 'Relatos Cortos', icon: 'file-alt', desc: 'Historias breves' },
                    ].map(template => (
                        <div key={template.id} className="template-card" onClick={() => applyTemplate(template.id)}>
                            <div className="template-icon"><i className={`fas fa-${template.icon}`}></i></div>
                            <div className="template-name">{template.name}</div>
                            <div className="template-desc">{template.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
