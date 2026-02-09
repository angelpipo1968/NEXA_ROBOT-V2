import React, { useState, useEffect } from 'react';
import { Eye, Code2, Check, Copy } from 'lucide-react';

interface CodePreviewProps {
    code: string;
    language: string;
}

export default function CodePreview({ code, language }: CodePreviewProps) {
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [copied, setCopied] = useState(false);

    // Only show preview for web technologies
    const canPreview = ['html', 'markup', 'svg', 'xml'].includes(language.toLowerCase());

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const PreviewFrame = () => {
        // Simple HTML boilerplate
        const srcDoc = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; color: #fff; }
                        /* Add Tailwind CDN for quick styling if used */
                        script { display: none; }
                    </style>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                    ${code}
                </body>
            </html>
        `;

        return (
            <div className="w-full h-64 bg-white rounded-b-lg overflow-hidden">
                <iframe
                    srcDoc={srcDoc}
                    title="Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts"
                />
            </div>
        );
    };

    return (
        <div className="my-4 rounded-lg border border-white/10 bg-[#1e1e2e] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-1">
                    {canPreview && (
                        <div className="flex p-1 bg-black/40 rounded-lg mr-2">
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`px-2 py-1 flex items-center gap-1 text-xs rounded-md transition-all ${activeTab === 'code' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Code2 size={12} /> Code
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-2 py-1 flex items-center gap-1 text-xs rounded-md transition-all ${activeTab === 'preview' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Eye size={12} /> Preview
                            </button>
                        </div>
                    )}
                    <span className="text-xs text-gray-400 uppercase font-mono">{language}</span>
                </div>

                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
            </div>

            {activeTab === 'preview' ? (
                <PreviewFrame />
            ) : (
                <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-200 bg-[#1e1e2e]">
                    <code>{code}</code>
                </pre>
            )}
        </div>
    );
}
