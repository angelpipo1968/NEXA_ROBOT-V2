'use client';

import React, { useState, useEffect } from 'react';
import styles from './ExpandirPanel.module.css';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface Suggestion {
    titulo: string;
    contenido: string;
    tipo: string;
    imageUrl?: string;
    sourceUrl?: string;
}

interface ExpandirPanelProps {
    initialContext: string;
    onClose: () => void;
    onApplySuggestion: (suggestion: Suggestion) => void;
    onRequestMoreContext: () => void;
}

export const ExpandirPanel: React.FC<ExpandirPanelProps> = ({
    initialContext,
    onClose,
    onApplySuggestion,
    onRequestMoreContext
}) => {
    const [modoActual, setModoActual] = useState<'ideas' | 'investigacion' | 'imagenes'>('ideas');
    const [subModo, setSubModo] = useState<string>('general');
    const [contexto, setContexto] = useState(initialContext);
    const [sugerencias, setSugerencias] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setContexto(initialContext);
    }, [initialContext]);

    // Modos principales alineados con la arquitectura solicitada
    // Ideas -> Gemini
    // Investigación -> Brave
    // Imágenes -> Google CSE
    const modos = [
        { id: 'ideas', icon: 'fas fa-brain', label: 'Ideas Creativas' },
        { id: 'investigacion', icon: 'fas fa-search', label: 'Investigación' },
        { id: 'imagenes', icon: 'fas fa-image', label: 'Imágenes Ref.' }
    ];

    const subModosIdeas = [
        { id: 'trama', label: 'Trama' },
        { id: 'personajes', label: 'Personajes' },
        { id: 'descripciones', label: 'Descripciones' },
        { id: 'dialogo', label: 'Diálogo' }
    ];

    const generarContenido = async () => {
        if (!contexto || contexto.length < 3) {
            setError('Por favor, selecciona un texto válido para trabajar.');
            return;
        }

        setLoading(true);
        setSugerencias([]);
        setError(null);

        // Determinar endpoint basado en el modo
        let endpoint = '/api/ai/expand'; // Default (Ideas/Gemini)

        // El payload variará ligeramente según el modo
        const payload = {
            text: contexto,
            mode: modoActual,
            subMode: subModo
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error al conectar con el servicio.');
            }

            const data = await response.json();
            setSugerencias(data.suggestions);
        } catch (err) {
            console.error(err);
            setError('Error al obtener resultados. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.expandirPanel}>
                {/* Cabecera */}
                <div className={styles.panelHeader}>
                    <h3><i className="fas fa-lightbulb"></i> Asistente de Expansión Creativa</h3>
                    <p>Potenciado por Gemini, Brave Search y Google Images</p>
                </div>

                {/* Selector de Modo */}
                <div className={styles.modoSelector}>
                    {modos.map((modo) => (
                        <div
                            key={modo.id}
                            className={`${styles.modoOpcion} ${modoActual === modo.id ? styles.activo : ''}`}
                            onClick={() => {
                                setModoActual(modo.id as any);
                                // Reset submodo si cambia a algo que no sea ideas
                                if (modo.id !== 'ideas') setSubModo('general');
                                else setSubModo('trama');
                            }}
                        >
                            <i className={modo.icon}></i>
                            <span>{modo.label}</span>
                        </div>
                    ))}
                </div>

                {/* Selector de Sub-Modo (solo para Ideas) */}
                {modoActual === 'ideas' && (
                    <div className="flex gap-2 justify-center mb-6 flex-wrap">
                        {subModosIdeas.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setSubModo(sub.id)}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${subModo === sub.id
                                    ? 'bg-blue-600 border-blue-400 text-white'
                                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Área de Contexto */}
                <div className={styles.contextoArea}>
                    <h4><i className="fas fa-book-open"></i> Contexto Seleccionado</h4>
                    <div className={styles.textoContexto}>
                        {contexto || <span className="text-gray-500">[Selecciona texto en el editor para comenzar]</span>}
                    </div>
                    <div className={styles.contextoAcciones}>
                        <button className={styles.btnSecundario} onClick={onRequestMoreContext}>
                            <i className="fas fa-expand-alt"></i> Actualizar Selección
                        </button>
                    </div>
                </div>

                {/* Resultados */}
                <div className={styles.resultadosIA}>
                    <div className={styles.resultadosHeader}>
                        <h4>
                            <i className={
                                modoActual === 'ideas' ? "fas fa-robot" :
                                    modoActual === 'investigacion' ? "fas fa-globe" : "fas fa-image"
                            }></i>
                            {modoActual === 'ideas' ? ' Sugerencias IA' :
                                modoActual === 'investigacion' ? ' Resultados Web' : ' Imágenes'}
                        </h4>
                        <div className={styles.resultadosControls}>
                            <button className={styles.btnIcon} onClick={generarContenido} disabled={loading}>
                                <i className="fas fa-redo"></i>
                            </button>
                        </div>
                    </div>

                    <div className={styles.sugerenciasLista}>
                        {loading ? (
                            <div className={styles.cargandoIA}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p>
                                    {modoActual === 'ideas' ? 'Consultando a Gemini...' :
                                        modoActual === 'investigacion' ? 'Buscando en la web con Brave...' : 'Buscando imágenes...'}
                                </p>
                            </div>
                        ) : error ? (
                            <div className={styles.sugerenciaPlaceholder}>
                                <i className="fas fa-exclamation-triangle"></i>
                                <p>{error}</p>
                            </div>
                        ) : sugerencias.length === 0 ? (
                            <div className={styles.sugerenciaPlaceholder}>
                                <i className="fas fa-magic"></i>
                                <p>Haz clic en "Generar" para obtener resultados</p>
                            </div>
                        ) : (
                            sugerencias.map((sug, index) => (
                                <div key={index} className={styles.sugerenciaItem}>
                                    <div className={styles.sugerenciaTitulo}>
                                        <span>{sug.titulo}</span>
                                        <span className={styles.sugerenciaBadge}>{sug.tipo}</span>
                                    </div>

                                    {/* Contenido Condicional según tipo */}
                                    <div className="mb-3 h-40">
                                        <ImageWithFallback src={sug.imageUrl} alt={sug.titulo} className="w-full h-full rounded-lg" />
                                    </div>

                                    <div className={styles.sugerenciaContenido}>
                                        {sug.contenido}
                                    </div>

                                    {sug.sourceUrl && (
                                        <div className="mb-2">
                                            <a href={sug.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                                                <i className="fas fa-external-link-alt mr-1"></i> Ver Fuente
                                            </a>
                                        </div>
                                    )}

                                    <div className={styles.sugerenciaAcciones}>
                                        <button
                                            className={styles.btnIcon}
                                            onClick={() => onApplySuggestion(sug)}
                                            title="Usar esto"
                                        >
                                            <i className="fas fa-check-circle"></i> {modoActual === 'imagenes' ? 'Insertar Imagen' : 'Usar Texto'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Acciones Principales */}
                <div className={styles.accionesPrincipales}>
                    <button className={styles.btnPrincipal} onClick={generarContenido} disabled={loading}>
                        {modoActual === 'ideas' ? '✨ Generar Ideas' :
                            modoActual === 'investigacion' ? '🔍 Investigar' : '🖼️ Buscar Imágenes'}
                    </button>
                    <button className={styles.btnTexto} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </>
    );
};
