import React, { useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
}

export function OptimizedImage({ src, alt, className = "" }: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const handleRetry = () => {
        setHasError(false);
        setIsLoaded(false);
        setRetryCount(prev => prev + 1);
    };

    const imageUrl = retryCount > 0
        ? `${src}${src.includes('?') ? '&' : '?'}_retry=${retryCount}`
        : src;

    return (
        <div className={`relative overflow-hidden rounded-xl bg-black/20 ${className}`}>
            {/* Placeholder / Loading State */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl animate-pulse flex items-center justify-center border border-white/10 rounded-xl z-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-[10px] text-white/30 font-medium tracking-widest uppercase">Nexa Vision</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/20 rounded-xl gap-3 z-30">
                    <div className="text-red-400 text-xs font-semibold">Error al cargar imagen</div>
                    <div className="text-[10px] text-white/30 max-w-full text-center px-4 italic line-clamp-2">"{alt}"</div>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold rounded-full transition-all border border-red-500/30 active:scale-95"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {!hasError && (
                <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        console.error('Image Load Failed:', imageUrl);
                        setHasError(true);
                    }}
                    className={`w-full h-auto transition-all duration-1000 ease-out ${isLoaded
                        ? 'opacity-100 scale-100 blur-0'
                        : 'opacity-0 scale-105 blur-lg'
                        }`}
                />
            )}
        </div>
    );
}
