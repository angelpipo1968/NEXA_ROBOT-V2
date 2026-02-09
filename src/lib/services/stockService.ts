/**
 * Stock Service - Alpha Vantage API Integration
 * Fetches real-time stock prices and quotes
 */

const STOCK_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const STOCK_API_BASE = 'https://www.alphavantage.co/query';

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    timestamp: number;
}

export interface StockHistoryData {
    date: string;
    price: number;
    high: number;
    low: number;
    volume: number;
}

/**
 * Fetch stock quote
 */
export async function fetchStockQuote(symbol: string): Promise<StockData> {
    if (!STOCK_API_KEY) {
        throw new Error('Alpha Vantage API key not configured. Add VITE_ALPHA_VANTAGE_API_KEY to your .env file.');
    }

    const upperSymbol = symbol.toUpperCase();
    const { retryWithBackoff } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        try {
            const response = await fetch(
                `${STOCK_API_BASE}?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${STOCK_API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Stock API error: ${response.status}`);
            }

            const data = await response.json();

            if (data['Error Message']) {
                throw new Error(`Stock symbol "${symbol}" not found`);
            }

            if (data['Note']) {
                throw new Error('API call frequency exceeded. Please try again later.');
            }

            const quote = data['Global Quote'];
            if (!quote || !quote['05. price']) {
                throw new Error(`No data available for symbol "${symbol}"`);
            }

            const price = parseFloat(quote['05. price']);
            const change = parseFloat(quote['09. change']);
            const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

            return {
                symbol: upperSymbol,
                name: upperSymbol, // Alpha Vantage free tier doesn't provide company names
                price,
                change,
                changePercent,
                high: parseFloat(quote['03. high']),
                low: parseFloat(quote['04. low']),
                volume: parseInt(quote['06. volume']),
                timestamp: Date.now()
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch stock data');
        }
    }, { maxRetries: 2, initialDelay: 600 });
}

/**
 * Fetch stock price history for charting
 */
export async function fetchStockHistory(
    symbol: string,
    days: number = 7
): Promise<StockHistoryData[]> {
    if (!STOCK_API_KEY) {
        throw new Error('Alpha Vantage API key not configured');
    }

    const upperSymbol = symbol.toUpperCase();
    const { retryWithBackoff } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        const response = await fetch(
            `${STOCK_API_BASE}?function=TIME_SERIES_DAILY&symbol=${upperSymbol}&apikey=${STOCK_API_KEY}`
        );

        if (!response.ok) throw new Error(`Stock API error: ${response.status}`);

        const data = await response.json();
        if (data['Error Message']) throw new Error(`Symbol "${symbol}" not found`);
        if (data['Note']) throw new Error('API rate limit exceeded');

        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) throw new Error('No historical data available');

        const dates = Object.keys(timeSeries).slice(0, days).reverse();
        return dates.map(date => ({
            date,
            price: parseFloat(timeSeries[date]['4. close']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low']),
            volume: parseInt(timeSeries[date]['5. volume'])
        }));
    }, { maxRetries: 2, initialDelay: 800 });
}

/**
 * Extract stock symbol from natural language query
 */
export function extractStockSymbol(query: string): string | null {
    // Pattern 1: Direct ticker symbol (e.g., "AAPL stock", "TSLA price")
    const tickerPattern = /\b([A-Z]{1,5})\b\s*(?:stock|price|quote|acciones|cotización|precio)?/;
    const match = query.match(tickerPattern);

    if (match && match[1]) {
        // Verify it looks like a stock ticker (2-5 uppercase letters)
        const symbol = match[1];
        if (symbol.length >= 2 && symbol.length <= 5) {
            return symbol;
        }
    }

    // Pattern 2: Company names to ticker mapping
    const companyMap: Record<string, string> = {
        'apple': 'AAPL',
        'microsoft': 'MSFT',
        'google': 'GOOGL',
        'amazon': 'AMZN',
        'tesla': 'TSLA',
        'meta': 'META',
        'facebook': 'META',
        'nvidia': 'NVDA',
        'netflix': 'NFLX',
        'disney': 'DIS'
    };

    const lowerQuery = query.toLowerCase();
    for (const [company, ticker] of Object.entries(companyMap)) {
        if (lowerQuery.includes(company)) {
            return ticker;
        }
    }

    return null;
}

/**
 * Format large numbers (e.g., 1M, 1B)
 */
export function formatLargeNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
}
