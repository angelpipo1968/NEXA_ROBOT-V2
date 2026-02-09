
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
        <div className={`relative overflow-hidden bg-white/5 ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] z-10">
                    <Loader2 className="w-8 h-8 text-[var(--vp-accent-purple)] animate-spin" />
                </div>
            )}

            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-muted)] z-20">
                    {fallback || (
                        <>
                            <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs mb-2">Error al cargar</span>
                            <button
                                onClick={handleRetry}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                title="Reintentar"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <img
                    src={`${src}${retryCount > 0 ? `&retry=${retryCount}` : ''}`} // Bust cache on retry if needed, but for Pollinations it might re-gen if seed is same?
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
                    onLoad={() => setIsLoading(false)}
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
