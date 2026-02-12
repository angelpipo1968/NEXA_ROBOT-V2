
import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff, RefreshCw } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallback,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Reset state when src changes
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [src, retryCount]);

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRetryCount(prev => prev + 1);
    };

    return (
        <div className={`relative overflow-hidden group bg-white/5 backdrop-blur-sm rounded-xl ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-10 transition-all duration-500">
                    <div className="relative">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse" />
                    </div>
                </div>
            )}

            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm text-zinc-400 z-20 p-4 text-center">
                    {fallback || (
                        <>
                            <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-[10px] font-medium uppercase tracking-wider mb-3">Error de Carga</span>
                            <button
                                onClick={handleRetry}
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 flex items-center gap-2 text-xs"
                                title="Reintentar"
                            >
                                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                                Reintentar
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoading ? 'scale-110 blur-2xl opacity-0' : 'scale-100 blur-0 opacity-100'}`}
                    onLoad={() => {
                        // Small delay to ensure blur clears smoothly
                        setTimeout(() => setIsLoading(false), 50);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    {...props}
                />
            )}
        </div>
    );
};
