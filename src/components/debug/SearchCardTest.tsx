import React from 'react';
import { SearchResultCard } from '../chat/SearchResultCard';
import { SearchStatusBadge } from '../chat/SearchStatusBadge';
import '../chat/SearchComponents.css';

export function SearchCardTest() {
    const mockResults = [
        {
            title: "Bitcoin USD (BTC-USD) Price",
            content: "Bitcoin price today: $78,677.45 with a 24-hour trading volume of $45.2B",
            url: "https://finance.yahoo.com/quote/BTC-USD/",
            source: "Yahoo Finance"
        },
        {
            title: "Bitcoin Price - CoinGecko",
            content: "The current price of Bitcoin is $78,650 with a market cap of $1.55T",
            url: "https://www.coingecko.com/en/coins/bitcoin",
            source: "CoinGecko"
        },
        {
            title: "BTC/USD - Kraken",
            content: "Bitcoin trading at $78,700 on Kraken exchange",
            url: "https://www.kraken.com/prices/bitcoin",
            source: "Kraken"
        }
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🧪 Search Card Test Component</h2>
            <p>Testing SearchResultCard and SearchStatusBadge rendering:</p>

            <div style={{ marginTop: '2rem' }}>
                <h3>Status Badges:</h3>
                <SearchStatusBadge status="searching" query="Bitcoin" />
                <SearchStatusBadge status="cached" />
                <SearchStatusBadge status="ai" />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3>Result Card:</h3>
                <SearchResultCard results={mockResults} query="precio de Bitcoin" />
            </div>
        </div>
    );
}
