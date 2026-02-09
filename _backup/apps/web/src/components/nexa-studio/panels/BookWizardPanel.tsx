import React, { useState } from 'react';
import { useNexa } from '../../../context/NexaContext';

export default function BookWizardPanel() {
    const { updateTitle, updateProjectContent, switchPanel, createNewProject } = useNexa();
    const [step, setStep] = useState(1);
    const [bookData, setBookData] = useState({
        title: '',
        genre: 'fiction',
        targetAudience: 'general',
        wordCount: 50000,
        language: 'es',
        description: ''
    });

    const genres = [
        'Ficción', 'No-Ficción', 'Ciencia Ficción', 'Fantasía', 'Misterio',
        'Romance', 'Biografía', 'Autoayuda', 'Negocios', 'Tecnología'
    ];

    const handleCreateBook = () => {
        // Init new project state
        createNewProject();

        // Set title
        updateTitle(bookData.title || "Nuevo Proyecto");

        // Create initial outline/content
        const initialContent = `# ${bookData.title}
## Información del Libro
**Género:** ${bookData.genre}
**Meta de Palabras:** ${bookData.wordCount.toLocaleString()}
**Descripción:** ${bookData.description}

## Esquema Generado
1. **Introducción**: Estableciendo el tono y el mundo.
2. **Desarrollo**: Presentación de personajes principales.
3. **Nudo**: El conflicto principal se revela.
4. **Clímax**: El punto de mayor tensión.
5. **Desenlace**: Resolución y cierre.

---
Empieza a escribir aquí...
`;
        updateProjectContent(initialContent);

        // Switch to editor
        switchPanel('editor');
    };

    return (
        <div className="panel-container" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Asistente de Nuevo Libro</h2>

            {/* Progress Steps */}
            <div className="wizard-steps" style={{ display: 'flex', marginBottom: '3rem', position: 'relative', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} style={{ zIndex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: step >= stepNum ? 'var(--primary)' : 'var(--bg-dark)',
                            border: `2px solid ${step >= stepNum ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 0.5rem auto', fontWeight: 'bold'
                        }}>
                            {stepNum}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: step >= stepNum ? 'white' : 'var(--text-secondary)' }}>
                            {stepNum === 1 ? 'Detalles' : stepNum === 2 ? 'Esquema' : 'Confirmar'}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Step 1: Details */}
                {step === 1 && (
                    <div className="form-group slide-in">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Título del Libro</label>
                            <input
                                type="text"
                                className="input-field"
                                value={bookData.title}
                                onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                                placeholder="El Misterio de..."
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Género</label>
                            <select
                                className="input-field"
                                value={bookData.genre}
                                onChange={(e) => setBookData({ ...bookData, genre: e.target.value })}
                                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            >
                                {genres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Meta de Palabras: {bookData.wordCount.toLocaleString()}</label>
                            <input
                                type="range"
                                min="5000" max="200000" step="5000"
                                value={bookData.wordCount}
                                onChange={(e) => setBookData({ ...bookData, wordCount: parseInt(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Description & Outline Preview */}
                {step === 2 && (
                    <div className="form-group slide-in">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción / Sinopsis</label>
                            <textarea
                                value={bookData.description}
                                onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                                style={{ width: '100%', height: '150px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                placeholder="Describe brevemente de qué trata tu libro..."
                            />
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}><i className="fas fa-magic"></i> Esquema Automático</h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <li style={{ marginBottom: '0.5rem' }}>1. Introducción (aprox. 10% palabras)</li>
                                <li style={{ marginBottom: '0.5rem' }}>2. Desarrollo y Conflicto (aprox. 50% palabras)</li>
                                <li style={{ marginBottom: '0.5rem' }}>3. Clímax (aprox. 25% palabras)</li>
                                <li>4. Desenlace (aprox. 15% palabras)</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="form-group slide-in text-center">
                        <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' }}>
                            <i className="fas fa-check"></i>
                        </div>
                        <h3>¡Todo listo!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Vamos a crear el proyecto <strong>"{bookData.title}"</strong> ({bookData.genre}).
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => step > 1 ? setStep(step - 1) : switchPanel('biblioteca')} // Go back to library if on step 1
                    >
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => step < 3 ? setStep(step + 1) : handleCreateBook()}
                    >
                        {step === 3 ? 'Crear Proyecto' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
