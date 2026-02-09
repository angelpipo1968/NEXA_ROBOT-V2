import React from 'react';

interface SearchStatusBadgeProps {
    status: 'searching' | 'ai' | 'cached';
    query?: string;
}

export function SearchStatusBadge({ status, query }: SearchStatusBadgeProps) {
    const configs = {
        searching: {
            icon: '🔍',
            text: 'Buscando en web...',
            className: 'status-searching',
            animation: 'pulse'
        },
        ai: {
            icon: '💭',
            text: 'Usando conocimiento de IA',
            className: 'status-ai',
            animation: 'none'
        },
        cached: {
            icon: '⚡',
            text: 'Resultado en caché',
            className: 'status-cached',
            animation: 'none'
        }
    };

    const config = configs[status];

    return (
        <div className={`search-status-badge ${config.className} ${config.animation === 'pulse' ? 'animate-pulse' : ''}`}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-text">{config.text}</span>
            {query && status === 'searching' && (
                <span className="status-query">"{query}"</span>
            )}
        </div>
    );
}
