import React, { useState } from 'react';
import { AlertTriangle, Zap, Brain, Shield } from 'lucide-react';

export function CrashSimulator() {
    const [isTriggered, setIsTriggered] = useState(false);

    const forceCrash = () => {
        setIsTriggered(true);
        // Force a synchronous error that React ErrorBoundary will catch
        throw new Error("CRASH_TEST: Simulación de fallo crítico en el Kernel de UI.");
    };

    return (
        <div className="p-6 bg-[#0a0f1a] rounded-2xl border border-red-500/20 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Centro de Pruebas de Resiliencia</h3>
            </div>

            <p className="text-sm text-gray-400">
                Este módulo permite probar el **Nexa Self-Healing Kernel**. Al activarlo, se forzará un error de renderizado en React para verificar que el sistema inmunitario detecte, analice y aprenda del fallo.
            </p>

            <button
                onClick={forceCrash}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                <Zap size={20} fill="currentColor" />
                FORZAR KERNEL PANIC
            </button>

            <div className="grid grid-cols-3 gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex flex-col items-center gap-1 p-2 bg-black/40 rounded-lg border border-white/5">
                    <Brain size={14} className="text-purple-400" />
                    <span className="text-[10px] font-bold">RAG ACTIVE</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-black/40 rounded-lg border border-white/5">
                    <Shield size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-bold">AUTO-FIX</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-black/40 rounded-lg border border-white/5">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-bold">LOW LATENCY</span>
                </div>
            </div>
        </div>
    );
}
