/**
 * News Service - NewsAPI Integration
 * Fetches latest news articles and headlines
 */

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    author?: string;
}

/**
 * Search for news articles
 */
export async function searchNews(query: string, language: string = 'en'): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) {
        throw new Error('NewsAPI key not configured. Add VITE_NEWS_API_KEY to your .env file.');
    }

    const { retryWithBackoff } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        try {
            const response = await fetch(
                `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key');
                }
                if (response.status === 429) {
                    throw new Error('API rate limit exceeded');
                }
                throw new Error(`News API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                throw new Error(data.message || 'News search failed');
            }

            return data.articles.map((article: any) => ({
                title: article.title,
                description: article.description || '',
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                imageUrl: article.urlToImage,
                author: article.author
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch news');
        }
    }, { maxRetries: 2, initialDelay: 400 });
}

/**
 * Extract news query from natural language
 */
export function extractNewsQuery(query: string): { query: string; language: string } | null {
    const lowerQuery = query.toLowerCase();

    // Check for news keywords
    const newsKeywords = ['news', 'noticias', 'headlines', 'breaking', 'última hora', 'actualidad'];
    const hasNewsKeyword = newsKeywords.some(kw => lowerQuery.includes(kw));

    if (!hasNewsKeyword) {
        return null;
    }

    // Detect language
    const spanishKeywords = ['noticias', 'última hora', 'actualidad'];
    const language = spanishKeywords.some(kw => lowerQuery.includes(kw)) ? 'es' : 'en';

    // Extract topic
    let topic = query;

    // Remove news keywords to get the topic
    const patterns = [
        /(?:latest|últimas?)\s+(.+?)\s+(?:news|noticias)/i,
        /(?:news|noticias)\s+(?:about|sobre)\s+(.+)/i,
        /(.+?)\s+(?:news|noticias)/i,
        /(?:news|noticias)\s+(.+)/i
    ];

    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
            topic = match[1].trim();
            break;
        }
    }

    return { query: topic, language };
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return date.toLocaleDateString();
}
