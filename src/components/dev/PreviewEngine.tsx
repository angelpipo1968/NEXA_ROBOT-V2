import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useProjectStore } from '@/store/useProjectStore';
import { Loader2, RefreshCw, Smartphone, Monitor, Terminal, Webhook } from 'lucide-react';
import { sandboxService } from '@/lib/sandbox';

interface PreviewEngineProps {
    className?: string;
}

export const PreviewEngine: React.FC<PreviewEngineProps> = ({ className }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { activeProject } = useProjectStore();
    const [viewport, setViewport] = useState<'mobile' | 'desktop'>('desktop');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!activeProject || !activeProject.files.length) return;

        let isMounted = true;
        const initSandbox = async () => {
            try {
                setStatus('booting');
                setLogs(['Iniciando contenedor WebContainer...']);

                // Formatear archivos para WebContainer API
                const webContainerFiles: Record<string, any> = {};
                activeProject.files.forEach(file => {
                    // Solo soporte plano por ahora (sin carpetas anidadas profundas)
                    const parts = file.path.split('/');
                    const fileName = parts[parts.length - 1];
                    webContainerFiles[fileName] = {
                        file: { contents: file.content }
                    };
                });

                // Si no hay package.json, inyectar el mock en un iframe estático
                if (!webContainerFiles['package.json']) {
                    setStatus('ready');
                    setPreviewUrl('static'); // Flag to render as static
                    renderStaticPreview();
                    return;
                }

                await sandboxService.mountFiles(webContainerFiles);
                setLogs(prev => [...prev.slice(-10), 'Archivos montados. Instalando dependencias...']);
                setStatus('installing');

                const exitCode = await sandboxService.installDependencies((data) => {
                    setLogs(prev => [...prev.slice(-10), data]);
                    try { useChatStore.getState().addTerminalLog(`[NPM] ${data}`) } catch (e) { }
                });

                if (exitCode !== 0) {
                    throw new Error('Instalación fallida');
                }

                setLogs(prev => [...prev.slice(-10), 'Dependencias listas. Iniciando servidor...']);
                setStatus('starting');

                sandboxService.onServerReady((url) => {
                    if (isMounted) {
                        setPreviewUrl(url);
                        setStatus('ready');
                    }
                });

                await sandboxService.runScript('start', (data) => {
                    setLogs(prev => [...prev.slice(-10), data]);
                    try { useChatStore.getState().addTerminalLog(`[DEV SERVER] ${data}`) } catch (e) { }
                });

            } catch (error: any) {
                console.error('[PreviewEngine]', error);
                setStatus('error');
                setLogs(prev => [...prev, `Error crítico: ${error.message}`]);
            }
        };

        const renderStaticPreview = () => {
            const doc = iframeRef.current?.contentDocument;
            if (!doc) return;
            const indexHtml = activeProject.files.find(f => f.name === 'index.html' || f.name.endsWith('html'))?.content || '<h1>No index.html</h1>';
            const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';
            doc.open();
            doc.write(indexHtml.replace('</head>', `${tailwindCDN}</head>`));
            doc.close();
        }

        initSandbox();

        return () => { isMounted = false; };
    }, [activeProject]);

    // Recargar iframe
    const handleReload = () => {
        if (iframeRef.current && previewUrl && previewUrl !== 'static') {
            iframeRef.current.src = previewUrl;
        } else if (previewUrl === 'static') {
            // Re-render static logic triggers via effect naturally but we can force it
            setStatus('booting'); setTimeout(() => setStatus('ready'), 200);
        }
    };

    return (
        <div className={`flex flex-col h-full bg-[#1e1e1e] border-l border-gray-800 ${className}`}>
            <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-[#151515] text-gray-400">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {status === 'ready' ? <Webhook size={14} className="text-cyan-400" /> : <Loader2 size={14} className="animate-spin text-purple-500" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {status === 'ready' ? 'Holocubierta Activa' : status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleReload} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 transition-colors" title="Recargar"><RefreshCw size={14} /></button>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded transition-colors ${viewport === 'mobile' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'}`}><Smartphone size={14} /></button>
                    <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded transition-colors ${viewport === 'desktop' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-800'}`}><Monitor size={14} /></button>
                </div>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                {status !== 'ready' && status !== 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10 font-mono">
                        <Loader2 size={40} className="animate-spin text-cyan-500 mb-6" />
                        <div className="w-64 space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className="text-[10px] text-gray-500 truncate">{log}</div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 z-10 font-mono text-red-400 p-8 text-center border border-red-900/50">
                        <Terminal size={40} className="mb-4 text-red-500 opacity-50" />
                        <h3 className="text-sm font-bold tracking-widest uppercase mb-2">WebContainer Error</h3>
                        <div className="text-xs space-y-1 opacity-80 max-w-md break-all">
                            {logs.slice(-3).map((l, i) => <p key={i}>{l}</p>)}
                        </div>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    src={previewUrl !== 'static' && previewUrl ? previewUrl : undefined}
                    className={`bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 ${viewport === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-[12px] border-[#0a0a0a]' : 'w-full h-full'}`}
                    allow="cross-origin-isolated"
                />
            </div>
        </div>
    );
};
