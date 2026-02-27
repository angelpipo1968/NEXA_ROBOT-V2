import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import React from 'react';

import { WRITING_TEMPLATES } from '@/data/writing-templates';

export default function TemplatesPanel() {
        const { updateProjectContent, updateTitle } = useProjectStore();
    const { switchPanel } = useUiStore();

    const handleApplyTemplate = (template: any) => {
        // Construct the content from the template structure
        let content = `# ${template.title}\n## ${template.subtitle}\n\n${template.description}\n\n## Estructura Sugerida\n`;
        template.structure.forEach((s: string) => {
            content += `- ${s}\n`;
        });

        content += `\n## Personajes\n`;
        template.characters.forEach((c: string) => {
            content += `- ${c}\n`;
        });

        content += `\n## Consejos\n${template.tips}\n\n--- Comienza a escribir aquí ---\n`;

        updateProjectContent(content);
        updateTitle(template.title);
        // Switch back to editor to see the result
        switchPanel('editor');
    };

    return (
        <div className="panel-container" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Plantillas de Escritura</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Selecciona una estructura profesional para comenzar tu próxima obra maestra.</p>

            <div className="templates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {WRITING_TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        className="template-card"
                        onClick={() => handleApplyTemplate(template)}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        <div className="template-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="template-icon" style={{
                                width: '40px', height: '40px',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2))',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#60a5fa',
                                fontSize: '1.2rem'
                            }}>
                                <i className={template.iconClass || "fas fa-book"}></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{template.title}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{template.genre}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                            {template.subtitle}
                        </p>

                        <div className="template-meta" style={{
                            display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af',
                            marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <span><i className="fas fa-layer-group" style={{ marginRight: '4px' }}></i>{template.chapters} caps</span>
                            <span><i className="fas fa-clock" style={{ marginRight: '4px' }}></i>{template.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
