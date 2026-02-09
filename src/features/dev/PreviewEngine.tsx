import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Loader2, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';

interface PreviewEngineProps {
    className?: string;
}

export const PreviewEngine: React.FC<PreviewEngineProps> = ({ className }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { activeProject, activeFile, mockNetworkLayer } = useChatStore();
    const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [key, setKey] = useState(0); // To force reload

    useEffect(() => {
        if (!activeProject || !iframeRef.current) return;

        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        // 1. Get Entry Point (index.html)
        const indexHtml = activeProject.files.find(f => f.name === 'index.html')?.content || '<h1>No index.html found</h1>';

        // 2. Transpile/Bundle Logic (Simplified for Browser)
        // In a real generic webcontainer, we'd use something heavier.
        // For this "Simulation", we inject scripts directly.

        // We need to inject the Mock Network Layer Interceptor
        const networkInterceptor = `
            <script>
                (function() {
                    const originalFetch = window.fetch;
                    const mockData = ${JSON.stringify(mockNetworkLayer)};
                    
                    window.fetch = async (url, options) => {
                        console.log('[Mock Network] Request:', url);
                        
                        // Check if URL matches a mock endpoint
                        // Simple matching: check if url ends with key
                        const endpoint = Object.keys(mockData).find(key => url.toString().includes(key));
                        
                        if (endpoint) {
                            console.log('[Mock Network] Intercepted:', endpoint);
                            return new Response(JSON.stringify(mockData[endpoint]), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        // Pass through to real internet (e.g. CDNs)
                        return originalFetch(url, options);
                    };
                    
                    console.log('Mock Network Layer Active');
                })();
            </script>
        `;

        // 3. Inject Styles & Scripts
        // We need to handle Tailwind CDN if mostly used
        const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';

        // Combine content
        const finalContent = indexHtml
            .replace('</head>', `${tailwindCDN}${networkInterceptor}</head>`)
            .replace('</body>', `</body>`);

        doc.open();
        doc.write(finalContent);
        doc.close();

    }, [activeProject, activeProject?.files, key, mockNetworkLayer]);

    const handleReload = () => setKey(prev => prev + 1);

    if (!activeProject) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                <p>No active project to preview</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-gray-50 ${className}`}>
            {/* Toolbar */}
            <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{activeProject.name}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewport('mobile')}
                            className={`p-1 rounded ${viewport === 'mobile' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}
                        >
                            <Smartphone size={14} />
                        </button>
                        <button
                            onClick={() => setViewport('tablet')}
                            className={`p-1 rounded ${viewport === 'tablet' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}
                        >
                            <Tablet size={14} />
                        </button>
                        <button
                            onClick={() => setViewport('desktop')}
                            className={`p-1 rounded ${viewport === 'desktop' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400'}`}
                        >
                            <Monitor size={14} />
                        </button>
                    </div>
                </div>
                <button onClick={handleReload} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Viewport Container */}
            <div className="flex-1 flex items-center justify-center bg-gray-200 overflow-hidden p-4">
                <div
                    className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden ${viewport === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-8 border-gray-800' :
                            viewport === 'tablet' ? 'w-[768px] h-[1024px] rounded-xl border-4 border-gray-800' :
                                'w-full h-full rounded-none border-0'
                        }`}
                >
                    <iframe
                        ref={iframeRef}
                        title="Preview"
                        className="w-full h-full bg-white"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                    />
                </div>
            </div>
        </div>
    );
};
