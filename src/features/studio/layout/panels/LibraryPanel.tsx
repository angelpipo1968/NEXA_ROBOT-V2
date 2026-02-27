import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import React from 'react';


export default function LibraryPanel() {
        const { createNewProject } = useProjectStore();
    const { switchPanel } = useUiStore();

    // Mock data for library
    const books = [
        { id: 1, title: 'El Susurro de las Estrellas', genre: 'Ciencia Ficción', progress: 45, lastEdited: 'Hace 2 horas' },
        { id: 2, title: 'Crónicas del Valle Perdido', genre: 'Fantasía', progress: 12, lastEdited: 'Ayer' },
        { id: 3, title: 'Sombras en la Niebla', genre: 'Thriller', progress: 89, lastEdited: 'Hace 3 días' },
    ];

    return (
        <div className="panel-content">
            <div className="panel-header">
                <h2><i className="fas fa-book"></i> Mi Biblioteca</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary"><i className="fas fa-filter"></i> Filtrar</button>
                    <button className="btn btn-primary" onClick={() => createNewProject()}><i className="fas fa-plus"></i> Nuevo Libro</button>
                </div>
            </div>

            <div className="library-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
                padding: '20px 0'
            }}>
                {books.map((book) => (
                    <div key={book.id} className="book-card" style={{
                        background: 'rgba(31, 41, 55, 0.6)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }} onClick={() => switchPanel('editor')}>
                        <div style={{
                            height: '140px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }}>
                            <i className="fas fa-book-open" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.8)' }}></i>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{book.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>{book.genre}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                            <span>{book.progress}% Completado</span>
                            <span>{book.lastEdited}</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px' }}>
                            <div style={{ width: `${book.progress}%`, background: 'var(--primary)', height: '100%', borderRadius: '2px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
