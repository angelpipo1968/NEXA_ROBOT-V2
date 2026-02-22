import React, { useState } from 'react';
import { X, Code2, Eye, Download, Copy, Check, Terminal, FileCode, Search } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useProjectStore } from '@/store/useProjectStore';

export default function ArtifactPanel() {
    const { isArtifactPanelOpen, setArtifactPanelOpen, terminalLogs } = useChatStore();
    const { activeFile } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'logs'>('code');
    const [copied, setCopied] = useState(false);

    if (!isArtifactPanelOpen) return null;

    const handleCopy = () => {
        if (activeFile) {
            navigator.clipboard.writeText(activeFile.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const canPreview = activeFile && ['html', 'markup', 'svg', 'xml'].includes(activeFile.language.toLowerCase());

    const PreviewFrame = () => {
        if (!activeFile) return null;
        const srcDoc = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #000; }
                    </style>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                    ${activeFile.content}
                </body>
            </html>
        `;

        return (
            <iframe
                srcDoc={srcDoc}
                title="Preview"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
            />
        );
    };

    return (
        <div
            id="nexa-pro-panel"
            className="flex flex-col h-full bg-[#0d0e12] border-l-2 border-[var(--vp-accent-purple)]/30 w-full md:w-[45%] md:min-w-[450px] fixed inset-0 md:relative z-[9999] md:z-20 animate-in slide-in-from-right duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#16171d]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--vp-accent-purple)]/20 rounded-lg">
                        <FileCode size={18} className="text-[var(--vp-accent-purple)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">
                            {activeFile?.name || 'Artifact Viewer'}
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                            {activeFile?.language || 'Unknown'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={() => setArtifactPanelOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-4 py-2 gap-4 border-b border-white/5 bg-[#121319]">
                <TabButton
                    active={activeTab === 'code'}
                    onClick={() => setActiveTab('code')}
                    icon={<Code2 size={14} />}
                    label="Code"
                />
                {canPreview && (
                    <TabButton
                        active={activeTab === 'preview'}
                        onClick={() => setActiveTab('preview')}
                        icon={<Eye size={14} />}
                        label="Preview"
                    />
                )}
                <TabButton
                    active={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                    icon={<Terminal size={14} />}
                    label="Tool Logs"
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#090a0e]">
                {activeTab === 'code' && (
                    <div className="h-full overflow-auto custom-scrollbar p-6 font-mono text-sm leading-relaxed">
                        <pre className="text-gray-300">
                            <code className="block whitespace-pre-wrap">{activeFile?.content || '// No se ha seleccionado ningún archivo'}</code>
                        </pre>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="h-full bg-white">
                        <PreviewFrame />
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="h-full overflow-auto custom-scrollbar bg-black p-4 font-mono text-[12px] text-green-500 space-y-1">
                        {terminalLogs.length === 0 ? (
                            <p className="text-gray-600 italic">No logs generated in this session.</p>
                        ) : (
                            terminalLogs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-gray-600 shrink-0"> nexa@agent:~$</span>
                                    <span>{log}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Status */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#16171d] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Project Live Sync
                </div>
                <div className="text-[11px] text-gray-600">
                    V1.5.0-PRO
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 py-2 text-xs font-medium transition-all relative ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
        >
            {icon}
            {label}
            {active && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--vp-accent-purple)] rounded-full shadow-[0_0_10px_var(--vp-accent-purple)]" />
            )}
        </button>
    );
}
