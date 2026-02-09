import React, { useState } from 'react';
import { toolService } from '@/lib/toolService';

interface SearchButtonProps {
    onSearchComplete: (result: string) => void;
}

export function QuickSearchButton({ onSearchComplete }: SearchButtonProps) {
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;

        console.log('[QUICK SEARCH] 🚀 Starting direct search for:', query);
        setSearching(true);

        try {
            const result = await toolService.execute('search_web', { query });
            console.log('[QUICK SEARCH] ✅ Got result:', result?.substring(0, 200));

            if (result) {
                onSearchComplete(`🔍 Resultados para "${query}":\n\n${result}`);
            } else {
                onSearchComplete('❌ No se encontraron resultados');
            }
        } catch (error) {
            console.error('[QUICK SEARCH] ❌ Error:', error);
            onSearchComplete(`❌ Error: ${(error as Error).message}`);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div style={{ padding: '10px', background: '#ff6b6b', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>🔍 Quick Search (Debug)</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search query..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={searching}
                    style={{
                        padding: '8px 16px',
                        background: searching ? '#ccc' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: searching ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {searching ? '⏳ Buscando...' : '🔍 Buscar'}
                </button>
            </div>
        </div>
    );
}
