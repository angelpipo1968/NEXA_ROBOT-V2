'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Cargar componente dinámicamente (sin SSR)
const TestHologram = dynamic(
    // @ts-ignore - Importing from package
    () => import('@nexa/hologram').then(mod => mod.TestHologram),
    {
        ssr: false, // IMPORTANTE: WebGL no funciona en SSR
        loading: () => (
            <div className="p-8 text-center text-white">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4" />
                <p>Cargando sistema holográfico...</p>
            </div>
        )
    }
);

export default function HologramTestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
            <div className="container mx-auto max-w-6xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-cyan-300">🔧</span> Prueba del Sistema Holográfico
                    </h1>
                    <p className="text-gray-400">
                        Diagnóstico y solución de problemas del holograma 3D
                    </p>
                </header>

                <Suspense fallback={
                    <div className="text-center py-12 text-white">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4" />
                        <h3 className="text-xl">Inicializando pruebas...</h3>
                    </div>
                }>
                    <TestHologram />
                </Suspense>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                    <div className="bg-gray-800/30 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-3">✅ Qué deberías ver</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                Una esfera azul cian girando
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                Efectos de transparencia
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                Wireframe alrededor de la esfera
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                Rotación suave a 60 FPS
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800/30 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-3">❌ Problemas comunes</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-500 rounded-full" />
                                Pantalla en negro (WebGL deshabilitado)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-500 rounded-full" />
                                Error "WebGL not supported"
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-500 rounded-full" />
                                FPS muy bajos (drivers antiguos)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-500 rounded-full" />
                                Artefactos gráficos (GPU problemas)
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/hologram-chat"
                        className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-white no-underline"
                    >
                        Ir al Holograma Completo
                    </a>
                </div>
            </div>
        </div>
    );
}
