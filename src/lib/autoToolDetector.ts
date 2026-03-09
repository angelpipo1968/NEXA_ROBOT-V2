import { toolService } from '@/lib/toolService';
import { geminiClient } from '@/lib/gemini';
import { searchCache, CacheType } from '@/lib/searchCache';
import { useSettingsStore } from '@/store/useSettingsStore';
import { fetchWeather, extractCityFromQuery } from '@/lib/services/weatherService';
import { convertCurrency, extractCurrencyConversion } from '@/lib/services/currencyService';
import { searchNews, extractNewsQuery } from '@/lib/services/newsService';
import { fetchStockQuote, extractStockSymbol } from '@/lib/services/stockService';

/**
 * Auto-detection and forced tool calling for search/price queries
 * This bypasses the ReAct pattern when we detect clear search intent
 */
export async function autoToolDetector(
    content: string,
    assistantMsgId: string,
    updateMessage: (id: string, updates: any) => void,
    setSearching: (searching: boolean) => void,
    getMessages: () => any[]
): Promise<string | null> {

    console.log('[AUTO-TOOL] 🚀 Function called with content:', content);

    const lowerContent = content.toLowerCase();

    // Keywords that trigger automatic search (bilingual: Spanish + English)
    const searchKeywords = [
        // Price/value queries
        'precio', 'price', 'costo', 'cost', 'valor', 'value', 'cuánto cuesta', 'how much',
        // Questions
        'cuál es', 'what is', 'qué es', 'quién es', 'who is', 'dónde', 'where',
        // Crypto
        'bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'btc', 'eth',
        // Weather
        'weather', 'clima', 'temperatura', 'temperature', 'forecast', 'pronóstico',
        // News
        'news', 'noticias', 'últimas noticias', 'headlines', 'breaking',
        // Stock/market
        'stock', 'acciones', 'bolsa', 'market', 'mercado', 'cotización',
        // Time-sensitive
        'hoy', 'today', 'ahora', 'now', 'actual', 'current', 'latest', 'último',
        // General search
        'busca', 'search', 'find', 'encuentra', 'información sobre', 'information about',
        // Travel & Flights (New)
        'pasaje', 'vuelo', 'ticket', 'boleto', 'viaje', 'votar', 'aerolínea', 'reserva', 'booking', 'flight',
        // Links & Pages (New)
        'link', 'enlace', 'página', 'url', 'web', 'sitio', 'portal',
        // Image generation
        'genera', 'crea', 'imagen', 'image', 'foto', 'photo', 'dibuja', 'draw', 'ilustración', 'illustration'
    ];

    // Priority 0: Check for currency conversion (highest priority due to specific pattern)
    const currencyKeywords = ['convert', 'convertir', 'usd', 'eur', 'gbp', 'jpy', 'mxn', 'exchange', 'cambio'];
    const hasCurrencyKeyword = currencyKeywords.some(kw => lowerContent.includes(kw));

    if (hasCurrencyKeyword) {
        const conversionData = extractCurrencyConversion(content);
        if (conversionData) {
            console.log('[AUTO-TOOL] 💱 Currency conversion detected:', conversionData);

            try {
                setSearching(true);
                const result = await convertCurrency(
                    conversionData.amount,
                    conversionData.from,
                    conversionData.to
                );

                const response = JSON.stringify({
                    type: 'currency_result',
                    conversion: result
                });

                setSearching(false);
                return response;
            } catch (error) {
                console.error('[AUTO-TOOL] ❌ Currency conversion failed:', error);
                setSearching(false);
                if (error instanceof Error && error.message.includes('API key not configured')) {
                    return `⚠️ Currency conversion requires API key. Add VITE_EXCHANGERATE_API_KEY to your .env file. Sign up at https://www.exchangerate-api.com/`;
                }
            }
        }
    }

    // Priority 1: Check for image generation queries
    const imageKeywords = ['genera', 'crea a', 'crea una', 'crea un', 'hacer una foto', 'generate', 'create a', 'create an', 'make a photo', 'dibuja', 'draw'];
    const hasImageKeyword = imageKeywords.some(kw => lowerContent.includes(kw));
    const containsImageObject = ['imagen', 'image', 'foto', 'photo', 'retrato', 'portrait', 'cuadro', 'painting', 'dibujo', 'drawing'].some(obj => lowerContent.includes(obj));

    if (hasImageKeyword && containsImageObject) {
        console.log('[AUTO-TOOL] 🎨 Image generation query detected:', content);

        try {
            updateMessage(assistantMsgId, { content: '🎨 Generando imagen con el motor Nexa Neural...' });
            setSearching(true);

            // Extract potential prompt - be smarter about hybrid queries
            let prompt = content;

            // Try to find where the image request starts
            const imageStarts = [
                'genera', 'crea', 'hacer', 'dibuja', 'generate', 'create', 'make', 'draw',
                'una imagen', 'una foto', 'un dibujo', 'un retrato', 'image of', 'photo of'
            ];

            for (const startWord of imageStarts) {
                const index = lowerContent.indexOf(startWord);
                if (index !== -1) {
                    prompt = content.substring(index);
                    break;
                }
            }

            // Standard cleaning
            prompt = prompt
                .replace(/genera|crea|haz|hacer|dibuja|generate|create|make|draw|una imagen de|una foto de|un dibujo de|un retrato de|image of|photo of|drawing of|portrait of|sobre|/gi, '')
                .replace(/^["'«„\s]+|["'»“\s]+$/g, '') // Remove quotes and surrounding whitespace
                .trim();

            if (!prompt || prompt.length < 3) prompt = content;

            const result = await toolService.execute('generate_image', { prompt, aspect_ratio: '1:1' });
            setSearching(false);
            return result;
        } catch (error) {
            console.error('[AUTO-TOOL] ❌ Image generation failed:', error);
            setSearching(false);
            // Fall through
        }
    }

    // Priority 2: Check for weather queries
    const weatherKeywords = ['weather', 'clima', 'temperatura', 'temperature', 'forecast', 'pronóstico'];
    const hasWeatherKeyword = weatherKeywords.some(kw => lowerContent.includes(kw));

    if (hasWeatherKeyword) {
        const city = extractCityFromQuery(content);
        if (city) {
            console.log('[AUTO-TOOL] 🌤️ Weather query detected for city:', city);

            try {
                setSearching(true);
                const weatherData = await fetchWeather(city);

                const result = JSON.stringify({
                    type: 'weather_result',
                    city: city,
                    data: weatherData
                });

                setSearching(false);
                return result;
            } catch (error) {
                console.error('[AUTO-TOOL] ❌ Weather fetch failed:', error);
                setSearching(false);
                // Fall through to general search
                if (error instanceof Error && error.message.includes('API key not configured')) {
                    return `⚠️ Weather feature requires API key. Add VITE_OPENWEATHER_API_KEY to your .env file. Sign up at https://openweathermap.org/api`;
                }
            }
        }
    }

    // Priority 2: Check for stock queries
    const stockKeywords = ['stock', 'acciones', 'share', 'nasdaq', 'nyse', 'ticker', 'cotización'];
    const hasStockKeyword = stockKeywords.some(kw => lowerContent.includes(kw));

    if (hasStockKeyword) {
        const symbol = extractStockSymbol(content);
        if (symbol) {
            console.log('[AUTO-TOOL] 📈 Stock query detected for symbol:', symbol);

            try {
                setSearching(true);
                const stockData = await fetchStockQuote(symbol);

                const result = JSON.stringify({
                    type: 'stock_result',
                    stock: stockData
                });

                setSearching(false);
                return result;
            } catch (error) {
                console.error('[AUTO-TOOL] ❌ Stock fetch failed:', error);
                setSearching(false);
                if (error instanceof Error && error.message.includes('API key not configured')) {
                    return `⚠️ Stock prices require API key. Add VITE_ALPHA_VANTAGE_API_KEY to your .env file. Sign up at https://www.alphavantage.co/`;
                }
            }
        }
    }

    // Priority 3: Check for news queries
    const newsKeywords = ['news', 'noticias', 'headlines', 'breaking', 'última hora', 'actualidad'];
    const hasNewsKeyword = newsKeywords.some(kw => lowerContent.includes(kw));

    if (hasNewsKeyword) {
        const newsQuery = extractNewsQuery(content);
        if (newsQuery) {
            console.log('[AUTO-TOOL] 📰 News query detected:', newsQuery);

            try {
                setSearching(true);
                const articles = await searchNews(newsQuery.query, newsQuery.language);

                const result = JSON.stringify({
                    type: 'news_results',
                    query: newsQuery.query,
                    articles: articles
                });

                setSearching(false);
                return result;
            } catch (error) {
                console.error('[AUTO-TOOL] ❌ News fetch failed:', error);
                setSearching(false);
                if (error instanceof Error && error.message.includes('API key not configured')) {
                    return `⚠️ News feature requires API key. Add VITE_NEWS_API_KEY to your .env file. Sign up at https://newsapi.org/`;
                }
            }
        }
    }

    // Priority 4: General web search
    const needsSearch = searchKeywords.some(keyword => lowerContent.includes(keyword));
    console.log('[AUTO-TOOL] 🔍 Keyword detection result:', needsSearch);
    console.log('[AUTO-TOOL] 📝 Content (lowercase):', lowerContent);

    if (!needsSearch) {
        console.log('[AUTO-TOOL] ❌ No search keywords detected - skipping');
        return null;
    }

    console.log('[AUTO-TOOL] ✅ Search keywords detected! Executing search...');

    // Check if user has disabled auto-search
    const { autoSearchEnabled, searchCacheEnabled } = useSettingsStore.getState();
    if (!autoSearchEnabled) {
        console.log('[AUTO-TOOL] ⚠️ Auto-search disabled in settings');
        return null;
    }

    // Check cache first (if enabled)
    if (searchCacheEnabled) {
        const cached = searchCache.get(content);
        if (cached) {
            console.log('[AUTO-TOOL] ⚡ Returning cached result');
            // Check if cached result is old JSON format or new text format
            try {
                const parsed = JSON.parse(cached);
                // If it's old structured format (has type: 'search_results'), convert it
                if (parsed?.type === 'search_results') {
                    // For old cached results, return them as-is (will show cards)
                    // New searches will use conversational format
                    parsed.isCached = true;
                    return JSON.stringify(parsed);
                }
                // Otherwise, it's already text format
                return cached;
            } catch {
                // Not JSON, it's plain text - return as-is
                return cached;
            }
        }
    }

    try {
        // Update UI
        console.log('[AUTO-TOOL] 💬 Updating message UI...');
        updateMessage(assistantMsgId, { content: '🔍 Buscando información en tiempo real...' });
        setSearching(true);

        // Clean up query
        let query = content
            .replace(/busca|search|cuál es|qué es|what is|how much|el precio de|the price of|dame/gi, '')
            .trim();

        if (!query || query.length < 3) query = content;
        console.log('[AUTO-TOOL] 🎯 Cleaned query:', query);

        // Execute search directly
        console.log('[AUTO-TOOL] 🌐 Calling toolService.execute("search_web", { query })...');
        const toolResult = await toolService.execute('search_web', { query });
        console.log('[AUTO-TOOL] 📊 Tool result length:', toolResult?.length || 0);
        console.log('[AUTO-TOOL] 📄 Tool result preview:', toolResult ? toolResult.substring(0, 200) + '...' : 'null');

        setSearching(false);

        if (!toolResult) {
            console.error('[AUTO-TOOL] ⚠️ No search results returned');
            throw new Error('No search results');
        }

        // Parse Tavily results
        console.log('[AUTO-TOOL] 🤖 Parsing and formatting results...');
        let parsed;
        try {
            parsed = JSON.parse(toolResult);
        } catch {
            // If not JSON, wrap as single result
            parsed = [{ title: 'Web Search', content: toolResult, url: '' }];
        }

        // Extract search results data
        const searchResults = parsed.slice(0, 5).map((r: any) => ({
            title: r.title || 'Result',
            content: r.content || r.snippet || '',
            url: r.url || '',
            source: extractSource(r.url)
        }));

        // Use Gemini to generate a natural conversational response
        console.log('[AUTO-TOOL] 💬 Generating conversational response...');
        let finalText: string;

        try {
            const context = getMessages().slice(0, -1).map(m => ({
                role: m.role,
                parts: m.content
            }));

            // Build a prompt that asks Gemini to answer naturally using the search results
            const resultsText = searchResults.map((r: any, i: number) =>
                `${i + 1}. ${r.title}\n   ${r.content}\n   Fuente: ${r.url || r.source}`
            ).join('\n\n');

            const formattingPrompt = `El usuario preguntó: "${content}"

He buscado en la web y encontré esta información:

${resultsText}

Responde de manera natural y conversacional, como si estuvieras hablando directamente con el usuario. Usa la información de los resultados de búsqueda para dar una respuesta completa.

REGLAS OBLIGATORIAS:
- DEBES incluir los ENLACES DIRECTOS (URLs) a las páginas encontradas, especialmente si el usuario busca comprar algo, reservar vuelos o entrar a un sitio específico.
- Si el usuario pide "links" o "páginas", dáselos explícitamente y con el URL completo.
- Sé directo, amigable y no menciones que estás "procesando resultados". Simplemente responde la pregunta del usuario usando esta información de manera fluida y natural.`;

            const geminiResponse = await geminiClient.chat({
                message: formattingPrompt,
                context: context,
                temperature: 0.7
            });

            const data = await geminiResponse.json();
            const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResult) {
                finalText = textResult;
            } else {
                throw new Error('Empty response from Gemini');
            }
        } catch (error) {
            console.error('[AUTO-TOOL] ⚠️ Fallback triggered:', error);
            // Enhanced Fallback: Always include the link
            const firstResult = searchResults[0];
            if (firstResult) {
                finalText = `${firstResult.content}\n\n[Ver página oficial de ${firstResult.title}](${firstResult.url})`;
            } else {
                finalText = `Lo siento, encontré información pero no pude cargar el enlace directo. Intenta buscar de nuevo.`;
            }
        }

        // Store in cache (if enabled) - store as plain text now
        const { searchCacheEnabled: cacheEnabled } = useSettingsStore.getState();
        if (cacheEnabled) {
            searchCache.set(content, finalText);
        }

        console.log('[AUTO-TOOL] ✅ Success! Returning conversational response');
        return finalText;

    } catch (error) {
        console.error('[AUTO-TOOL] ❌ ERROR:', error);
        console.error('[AUTO-TOOL] ❌ Error stack:', (error as Error).stack);
        setSearching(false);
        return null; // Return null to fall through to normal AI processing
    }
}

function extractSource(url: string): string {
    if (!url) return 'web';
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (hostname.includes('coinmarketcap')) return 'CoinMarketCap';
        if (hostname.includes('coingecko')) return 'CoinGecko';
        if (hostname.includes('kraken')) return 'Kraken';
        if (hostname.includes('tradingview')) return 'TradingView';
        return hostname;
    } catch {
        return 'web';
    }
}
