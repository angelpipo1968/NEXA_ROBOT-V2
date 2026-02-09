/**
 * Currency Service - ExchangeRate-API Integration
 * Fetches real-time exchange rates and performs conversions
 */

const CURRENCY_API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY;
const CURRENCY_API_BASE = 'https://v6.exchangerate-api.com/v6';

export interface CurrencyConversion {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    timestamp: number;
}

/**
 * Convert currency from one to another
 */
export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
): Promise<CurrencyConversion> {
    if (!CURRENCY_API_KEY) {
        throw new Error('ExchangeRate API key not configured. Add VITE_EXCHANGERATE_API_KEY to your .env file.');
    }

    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    const { retryWithBackoff } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        try {
            const response = await fetch(
                `${CURRENCY_API_BASE}/${CURRENCY_API_KEY}/pair/${from}/${to}/${amount}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Currency pair ${from}/${to} not found`);
                }
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                throw new Error(`Currency API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.result !== 'success') {
                throw new Error(data['error-type'] || 'Currency conversion failed');
            }

            return {
                from,
                to,
                amount,
                result: data.conversion_result,
                rate: data.conversion_rate,
                timestamp: data.time_last_update_unix * 1000
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to convert currency');
        }
    }, { maxRetries: 2, initialDelay: 300 });
}

/**
 * Extract currency conversion from natural language query
 * Patterns: "100 USD to EUR", "convert 50 euros to pesos", "1000 yen to dollars"
 */
export function extractCurrencyConversion(query: string): { amount: number; from: string; to: string } | null {
    const patterns = [
        // "100 USD to EUR", "50 usd to eur"
        /(\d+\.?\d*)\s*([a-z]{3})\s+to\s+([a-z]{3})/i,
        // "convert 100 dollars to euros"
        /convert\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(\w+)/i,
        // "convertir 50 euros a pesos"
        /convertir\s+(\d+\.?\d*)\s+(\w+)\s+a\s+(\w+)/i,
        // "100 dólares a euros"
        /(\d+\.?\d*)\s+(\w+)\s+a\s+(\w+)/i
    ];

    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const from = mapCurrencyName(match[2]);
            const to = mapCurrencyName(match[3]);

            if (from && to && !isNaN(amount)) {
                return { amount, from, to };
            }
        }
    }

    return null;
}

/**
 * Map currency names/symbols to ISO codes
 */
function mapCurrencyName(name: string): string {
    const currencyMap: Record<string, string> = {
        // English
        'dollar': 'USD',
        'dollars': 'USD',
        'euro': 'EUR',
        'euros': 'EUR',
        'pound': 'GBP',
        'pounds': 'GBP',
        'yen': 'JPY',
        'yuan': 'CNY',
        'peso': 'MXN',
        'pesos': 'MXN',
        // Spanish
        'dólar': 'USD',
        'dólares': 'USD',
        // Direct codes
        'usd': 'USD',
        'eur': 'EUR',
        'gbp': 'GBP',
        'jpy': 'JPY',
        'cny': 'CNY',
        'mxn': 'MXN',
        'ars': 'ARS',
        'brl': 'BRL',
        'cad': 'CAD',
        'chf': 'CHF',
        'aud': 'AUD',
        'inr': 'INR',
        'krw': 'KRW'
    };

    const lower = name.toLowerCase();
    return currencyMap[lower] || name.toUpperCase();
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'MXN': '$',
        'ARS': '$',
        'BRL': 'R$',
        'CAD': 'C$',
        'CHF': 'Fr',
        'AUD': 'A$',
        'INR': '₹',
        'KRW': '₩'
    };
    return symbols[code] || code;
}

/**
 * Get currency flag emoji
 */
export function getCurrencyFlag(code: string): string {
    const flags: Record<string, string> = {
        'USD': '🇺🇸',
        'EUR': '🇪🇺',
        'GBP': '🇬🇧',
        'JPY': '🇯🇵',
        'CNY': '🇨🇳',
        'MXN': '🇲🇽',
        'ARS': '🇦🇷',
        'BRL': '🇧🇷',
        'CAD': '🇨🇦',
        'CHF': '🇨🇭',
        'AUD': '🇦🇺',
        'INR': '🇮🇳',
        'KRW': '🇰🇷'
    };
    return flags[code] || '🌐';
}
