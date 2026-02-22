import React from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

interface ArtifactCardProps {
    filename: string;
    content: string;
    language?: string;
}

import { useChatStore } from '@/store/useChatStore';
import { useProjectStore } from '@/store/useProjectStore';

export default function ArtifactCard({ filename, content, language }: ArtifactCardProps) {
    const { setArtifactPanelOpen } = useChatStore();
    const { setActiveFile } = useProjectStore();

    // Auto-open on mount for new artifacts
    React.useEffect(() => {
        handleOpen();
    }, []);

    const handleOpen = () => {
        setActiveFile({
            name: filename,
            content,
            language: language || 'text',
            path: `./artifacts/${filename}`
        });
        setArtifactPanelOpen(true);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div
            onClick={handleOpen}
            className="my-3 p-3 rounded-xl border border-white/10 bg-[#1e1e2e] shadow-lg flex items-center justify-between group hover:border-[var(--vp-accent-purple)]/50 transition-all cursor-pointer overflow-hidden transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--vp-accent-purple)]/10 flex items-center justify-center text-[var(--vp-accent-purple)]">
                    <FileText size={20} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white truncate max-w-[150px]">{filename}</h3>
                    <div className="text-[10px] text-[var(--vp-accent-purple)]/60 flex items-center gap-1 uppercase tracking-tighter font-bold">
                        <CheckCircle2 size={10} /> Nexus Artifact
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-2 text-xs font-medium"
            >
                <Download size={14} />
            </button>
        </div>
    );
}
