import React from 'react';

interface SearchResult {
    title: string;
    content: string;
    url?: string;
    source?: string;
}

interface SearchResultCardProps {
    results: SearchResult[];
    query: string;
}

export function SearchResultCard({ results, query }: SearchResultCardProps) {
    if (!results || results.length === 0) return null;

    return (
        <div className="search-results-container">
            <div className="search-header">
                <span className="search-icon">🔍</span>
                <h3 className="search-title">Resultados de búsqueda para "{query}"</h3>
            </div>

            <div className="results-grid">
                {results.map((result, index) => (
                    <div key={index} className="result-card">
                        <div className="result-header">
                            <h4 className="result-title">{result.title}</h4>
                            {result.source && (
                                <span className="source-badge">
                                    {getSourceIcon(result.source)} {result.source}
                                </span>
                            )}
                        </div>

                        <p className="result-content">{result.content}</p>

                        {result.url && (
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="result-link"
                            >
                                Ver fuente →
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
        'coinmarketcap': '💰',
        'coingecko': '🦎',
        'kraken': '🐙',
        'tradingview': '📊',
        'web': '🌐',
        'news': '📰',
        'weather': '🌤️',
        'default': '📄'
    };

    const key = source.toLowerCase().replace(/\s+/g, '');
    return icons[key] || icons.default;
}
