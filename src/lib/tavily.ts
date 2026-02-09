export interface TavilySearchRequest {
    query: string;
    max_results?: number;
    search_depth?: 'basic' | 'advanced';
    include_images?: boolean;
}

export const tavilyClient = {
    search: async (payload: TavilySearchRequest) => {
        const apiKey = import.meta.env.VITE_TAVILY_API_KEY;

        if (!apiKey) {
            console.warn('Missing Tavily API Key');
            return null; // Fail gracefully if no key
        }

        const url = '/tavily-api/search';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    query: payload.query,
                    max_results: payload.max_results || 5,
                    search_depth: payload.search_depth || 'basic',
                    include_images: payload.include_images || false,
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Tavily API Error:', errData);
                return null;
            }

            const data = await response.json();
            return data.results; // Returns array of { title, url, content, score, ... }

        } catch (error) {
            console.error('Tavily Client Error:', error);
            return null;
        }
    }
};
