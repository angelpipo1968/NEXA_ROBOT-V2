import React, { useState } from 'react';
import { sandboxService } from '@/lib/services/sandboxService';
import { Terminal, Play, Box, Loader2 } from 'lucide-react';

export function SandboxLab() {
    const [code, setCode] = useState(`console.log("¡Hola desde el Sandbox de Nexa!");`);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Arrancando contenedor efímero...');
        try {
            const files = {
                'index.js': {
                    file: {
                        contents: code,
                    },
                },
                'package.json': {
                    file: {
                        contents: JSON.stringify({
                            name: 'nexa-sandbox',
                            type: 'module',
                        }),
                    },
                },
            };

            const result: any = await sandboxService.runCode(files, 'node', ['index.js']);
            setOutput(result.output || 'Proceso finalizado sin salida.');
        } catch (error) {
            setOutput(`Error de ejecución: ${(error as any).message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-full bg-[#0a0a0f] p-8 flex flex-col gap-6 font-mono text-cyan-400">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Box className="text-cyan-500" />
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sandbox Seguro</h2>
                        <p className="text-[10px] text-gray-500 uppercase">Aislamiento WebContainer Tier-1</p>
                    </div>
                </div>
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all disabled:opacity-50"
                >
                    {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                    EJECUTAR SCRIPT
                </button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Editor de Código</label>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none custom-scrollbar"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Consola de Salida</label>
                    <div className="flex-1 bg-black border border-white/10 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 text-gray-600 mb-4 pb-2 border-b border-white/5">
                            <Terminal size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">nexa-os@sandbox:~$</span>
                        </div>
                        <pre className="text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
                            {output}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
