
"use client";

import React from 'react';
import { useNexa } from '@/context/NexaContext';

import { MemoryGalaxy } from '@/components/brain/MemoryGalaxy';

export default function SettingsPanel() {
    const { aiConfig, voiceConfig, updateVoiceConfig } = useNexa();

    return (
        <div className="panel-content">
            <div className="panel-header">
                <h2><i className="fas fa-cog"></i> Configuración</h2>
                <p className="panel-subtitle">Personaliza tu experiencia en Nexa Studio</p>
            </div>

            <div className="settings-container" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '30px' }}>

                {/* Nexa Brain / Memory Core Section */}
                <div style={{ marginBottom: '30px' }}>
                    <MemoryGalaxy />
                </div>

                <div className="settings-section" style={{
                    background: 'rgba(31, 41, 55, 0.4)',
                    padding: '25px', borderRadius: '15px',
                    marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', color: 'var(--primary-light)' }}>
                        <i className="fas fa-brain"></i> Configuración de IA
                    </h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Modelo de IA Principal</label>
                        <select className="format-select" style={{ width: '100%', padding: '10px' }} defaultValue="gemini-pro">
                            <option value="gemini-pro">Google Gemini Pro 1.5 (Recomendado)</option>
                            <option value="gemini-ultra">Google Gemini Ultra</option>
                            <option value="gpt-4">GPT-4 Turbo</option>
                            <option value="claude-3">Claude 3 Opus</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Creatividad (Temperatura)</label>
                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" style={{ width: '100%' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                            <span>Preciso</span>
                            <span>Balanceado</span>
                            <span>Creativo</span>
                        </div>
                    </div>
                </div>

                <div className="settings-section" style={{
                    background: 'rgba(31, 41, 55, 0.4)',
                    padding: '25px', borderRadius: '15px',
                    marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', color: 'var(--secondary)' }}>
                        <i className="fas fa-microphone-alt"></i> Configuración de Voz
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <label>Habilitar narración automática</label>
                        <input
                            type="checkbox"
                            checked={voiceConfig.enabled}
                            onChange={(e) => updateVoiceConfig({ enabled: e.target.checked })}
                            style={{ transform: 'scale(1.5)' }}
                        />
                    </div>
                </div>

                <div className="settings-section" style={{
                    background: 'rgba(31, 41, 55, 0.4)',
                    padding: '25px', borderRadius: '15px',
                    marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', color: 'white' }}>
                        <i className="fas fa-user-circle"></i> Cuenta
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>TU</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Escritor Nexa</div>
                            <div style={{ color: 'var(--gray-400)' }}>escritor@nexa.ai</div>
                        </div>
                        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Gestionar Suscripción</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
