'use client';

import { useEffect, useRef, useState } from 'react';
import { SimpleHologram } from '../core/SimpleHologram';

export function TestHologram() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hologramRef = useRef<SimpleHologram | null>(null);
    const [status, setStatus] = useState<string>('Inicializando...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = () => {
            try {
                if (!canvasRef.current) {
                    setError('Canvas no encontrado');
                    return;
                }

                // Verificar WebGL
                const canvas = canvasRef.current;
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

                if (!gl) {
                    setError('WebGL no está disponible en este navegador/dispositivo');
                    return;
                }

                // Crear holograma simple
                hologramRef.current = new SimpleHologram(canvas);

                // Verificar estado
                if (hologramRef.current.isWorking()) {
                    setStatus(hologramRef.current.getStatus());
                } else {
                    setError('Holograma no se pudo inicializar');
                }

            } catch (err: any) {
                console.error('Error inicializando holograma:', err);
                setError(err.message || 'Error desconocido');
            }
        };

        init();

        // Cleanup
        return () => {
            hologramRef.current = null;
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-cyan-300">
                🔧 Prueba de Holograma
            </h2>

            {/* Canvas para WebGL */}
            <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden mb-4">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    width={800}
                    height={600}
                />

                {/* Overlay de estado */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`h-3 w-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'
                            }`} />
                        <span className="text-sm">
                            {error ? 'Error' : 'Funcionando'}
                        </span>
                    </div>
                    <div className="text-xs font-mono max-w-xs whitespace-pre-wrap">
                        {error || status}
                    </div>
                </div>
            </div>

            {/* Panel de controles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded">
                    <h3 className="font-semibold mb-2 text-white">🛠️ Solución de Problemas</h3>
                    <ul className="text-sm space-y-1 text-gray-300">
                        <li>1. Verifica que WebGL esté habilitado</li>
                        <li>2. Actualiza drivers gráficos</li>
                        <li>3. Usa Chrome/Edge/Firefox</li>
                        <li>4. Desactiva bloqueadores WebGL</li>
                    </ul>
                </div>

                <div className="bg-gray-800/50 p-4 rounded text-white">
                    <h3 className="font-semibold mb-2">📊 Estado del Sistema</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>WebGL:</span>
                            <span className={error ? 'text-red-400' : 'text-green-400'}>
                                {error ? 'NO' : 'SÍ'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Three.js:</span>
                            <span className="text-yellow-400">Cargando...</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Renderizado:</span>
                            <span className="text-green-400">Activo</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded text-white">
                    <h3 className="font-semibold mb-2">🔧 Acciones</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                            Reiniciar Prueba
                        </button>
                        {/* Note: chrome:// links allowed? probably not but keeping simple */}
                        <button
                            onClick={() => window.open('https://get.webgl.org/', '_blank')}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                        >
                            Test WebGL
                        </button>
                    </div>
                </div>
            </div>

            {/* Información de error detallada */}
            {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded text-white">
                    <h3 className="font-semibold text-red-300 mb-2">❌ Error Detectado</h3>
                    <p className="text-sm mb-3">{error}</p>
                    <div className="text-sm">
                        <p className="font-semibold">Soluciones posibles:</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-1">
                            <li>Abre <code>chrome://flags</code> y habilita "Override software rendering list"</li>
                            <li>Actualiza tu navegador a la última versión</li>
                            <li>Actualiza los drivers de tu tarjeta gráfica</li>
                            <li>Prueba en un navegador diferente (Chrome, Edge, Firefox)</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
}
