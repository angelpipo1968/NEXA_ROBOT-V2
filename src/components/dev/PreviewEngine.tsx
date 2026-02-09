// Retrying creation in the correct directory once found 
// (Holding off on content until path is confirmed, but code is ready)
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Loader2, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';

interface PreviewEngineProps {
    className?: string;
}

export const PreviewEngine: React.FC<PreviewEngineProps> = ({ className }) => {
    // ... (Implementation same as before)
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { activeProject, activeFile, mockNetworkLayer } = useChatStore();
    const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [key, setKey] = useState(0); // To force reload

    useEffect(() => {
        if (!activeProject || !iframeRef.current) return;

        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        // 1. Get Entry Point
        // 1. Get Entry Point - Robust Lookup
        const indexHtml = activeProject.files.find(f =>
            f.name === 'index.html' ||
            f.path === 'index.html' ||
            f.path.endsWith('/index.html')
        )?.content || '<h1>No index.html found. Please regenerate or check file structure.</h1>';

        // 2. Inject Mock Network Layer
        const networkInterceptor = `
            <script>
                (function() {
                    const originalFetch = window.fetch;
                    const mockData = ${JSON.stringify(mockNetworkLayer)};
                    
                    window.fetch = async (url, options) => {
                        console.log('[Mock Network] Request:', url);
                        const endpoint = Object.keys(mockData).find(key => url.toString().includes(key));
                        
                        if (endpoint) {
                           console.log('[Mock Network] Intercepted:', endpoint);
                           // Simulate network delay
                           await new Promise(r => setTimeout(r, 500));
                           return new Response(JSON.stringify(mockData[endpoint]), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                           });
                        }
                        return originalFetch(url, options);
                    };
                    console.log('Mock Network Layer Active');
                })();
            </script>
        `;

        const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';

        const finalContent = indexHtml
            .replace('</head>', `${tailwindCDN}${networkInterceptor}</head>`);

        doc.open();
        doc.write(finalContent);
        doc.close();

    }, [activeProject, activeProject?.files, key, mockNetworkLayer]);

    // UI Render
    // ... (Same UI code as previous attempt)
    return (
        <div className={`flex flex-col bg-gray-50 h-full ${className}`}>
            <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{activeProject?.name || 'Untitled'}</span>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-4">
                        <button onClick={() => setViewport('mobile')} className={`p-1 rounded ${viewport === 'mobile' ? 'bg-white shadow text-blue-500' : 'text-gray-400'}`}><Smartphone size={14} /></button>
                        <button onClick={() => setViewport('desktop')} className={`p-1 rounded ${viewport === 'desktop' ? 'bg-white shadow text-blue-500' : 'text-gray-400'}`}><Monitor size={14} /></button>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center overflow-hidden p-4">
                <iframe
                    ref={iframeRef}
                    className={`bg-white shadow-xl transition-all ${viewport === 'mobile' ? 'w-[375px] h-[667px] rounded-2xl border-4 border-gray-800' : 'w-full h-full'}`}
                />
            </div>
        </div>
    );
};
