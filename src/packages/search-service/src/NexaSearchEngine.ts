import axios from 'axios';
import {
    SearchProviderConfig,
    SearchResponse,
    SearchResult,
    SearchSource,
    SearchStats,
    CacheEntry
} from './types';
import { URL } from 'url';

export class NexaSearchEngine {
    public config: Record<SearchSource | string, SearchProviderConfig>;
    public priorityOrder: SearchSource[];
    private cache: Map<string, CacheEntry>;
    private lastRequest: Map<string, number>;

    constructor() {
        this.cache = new Map();
        this.lastRequest = new Map();

        this.config = {
            duckduckgo: {
                enabled: true,
                type: 'official',
                url: 'https://api.duckduckgo.com',
                timeout: 3,
                cooldown: 0
            },
            searxng: {
                enabled: true,
                type: 'public',
                instances: [
                    'https://searx.be',
                    'https://search.unlocked.link',
                    'https://searxng.site',
                    'https://searx.work',
                    'https://northboot.xyz'
                ],
                url: '', // Base URL set dynamically
                timeout: 5,
                cooldown: 1
            },
            brave: {
                enabled: !!process.env.BRAVE_SEARCH_API_KEY,
                type: 'official',
                key: process.env.BRAVE_SEARCH_API_KEY,
                url: 'https://api.search.brave.com/res/v1/web/search',
                timeout: 4,
                quota: { daily: 2000, used: 0, reset: null }
            },
            you: {
                enabled: !!process.env.YOU_API_KEY,
                type: 'official',
                key: process.env.YOU_API_KEY,
                url: 'https://api.you.com/search/web',
                timeout: 4,
                quota: { daily: 1000, used: 0, reset: null }
            },
            google_cse: {
                enabled: !!(process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_CX),
                type: 'official',
                key: process.env.GOOGLE_CSE_KEY,
                cx: process.env.GOOGLE_CSE_CX,
                url: 'https://www.googleapis.com/customsearch/v1',
                timeout: 4,
                quota: { daily: 100, used: 0, reset: null }
            },
            serpapi: {
                enabled: !!process.env.SERPAPI_KEY,
                type: 'official',
                key: process.env.SERPAPI_KEY,
                url: 'https://serpapi.com/search',
                timeout: 4,
                quota: { monthly: 100, used: 0, reset: null }
            },
            bing: {
                enabled: !!process.env.BING_API_KEY,
                type: 'official',
                key: process.env.BING_API_KEY,
                url: 'https://api.bing.microsoft.com/v7.0/search',
                timeout: 4,
                quota: { monthly: 1000, used: 0, reset: null }
            }
        };

        this.priorityOrder = ['duckduckgo', 'searxng', 'brave', 'you', 'google_cse', 'serpapi', 'bing'];

        // Initialize lastRequest map
        for (const engine of Object.keys(this.config)) {
            this.lastRequest.set(engine, 0);
        }
    }

    public async search(query: string, maxResults: number = 10, fastMode: boolean = false): Promise<SearchResponse> {
        const startTime = Date.now();
        const cacheKey = `${query.toLowerCase().trim()}|${maxResults}`;

        // Cache hit (5 min TTL)
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!;
            // 300 seconds = 300000 ms
            if (Date.now() - cached.timestamp < 300000) {
                return cached.data;
            }
        }

        const response: SearchResponse = {
            query,
            timestamp: new Date().toISOString(),
            execution_time: 0,
            total_results: 0,
            sources_used: [],
            results: []
        };

        const activePriority = fastMode
            ? ['duckduckgo', 'searxng'] as SearchSource[]
            : this.priorityOrder;

        for (const engine of activePriority) {
            if (!this.config[engine]?.enabled) continue;

            const config = this.config[engine];

            // Cooldown check
            const lastReqStr = this.lastRequest.get(engine) || 0;
            const cooldownMs = (config.cooldown || 0) * 1000;
            const timeSinceLast = Date.now() - lastReqStr;

            if (timeSinceLast < cooldownMs) {
                await new Promise(resolve => setTimeout(resolve, cooldownMs - timeSinceLast));
            }

            try {
                this.lastRequest.set(engine, Date.now());
                let results: SearchResult[] = [];

                switch (engine) {
                    case 'duckduckgo':
                        results = await this._searchDuckDuckGo(query, maxResults);
                        break;
                    case 'searxng':
                        results = await this._searchSearXNG(query, maxResults);
                        break;
                    case 'brave':
                        results = await this._searchBrave(query, maxResults);
                        break;
                    case 'you':
                        results = await this._searchYou(query, maxResults);
                        break;
                    case 'google_cse':
                        results = await this._searchGoogleCSE(query, maxResults);
                        break;
                    case 'serpapi':
                        results = await this._searchSerpApi(query, maxResults);
                        break;
                    case 'bing':
                        results = await this._searchBing(query, maxResults);
                        break;
                }

                if (results.length > 0) {
                    response.sources_used.push(engine as SearchSource);
                    response.results.push(...results);

                    if (config.quota) {
                        config.quota.used += 1;
                    }

                    // Early exit if enough unique results
                    if (this._removeDuplicates(response.results).length >= maxResults) {
                        break;
                    }
                }
            } catch (error: any) {
                // Silent fail in production logic, similar to python script
                // console.error(`[NEXA] Error in ${engine}: ${error.message}`);
                continue;
            }
        }

        response.results = this._removeDuplicates(response.results).slice(0, maxResults);
        response.total_results = response.results.length;
        response.execution_time = (Date.now() - startTime) / 1000;

        // Save to cache
        this.cache.set(cacheKey, {
            timestamp: Date.now(),
            data: response
        });

        return response;
    }

    // ────────────────────────────────────────────────────────────────────
    // 🔍 SEARCH METHODS
    // ────────────────────────────────────────────────────────────────────

    private async _searchDuckDuckGo(query: string, limit: number): Promise<SearchResult[]> {
        const params = {
            q: query,
            format: 'json',
            no_html: 1,
            skip_disambig: 1,
            t: 'NEXA'
        };
        const { data } = await axios.get(this.config.duckduckgo.url, {
            params,
            timeout: this.config.duckduckgo.timeout * 1000
        });

        const results: SearchResult[] = [];
        if (data.AbstractURL) {
            results.push({
                title: data.Heading || query,
                url: data.AbstractURL,
                source: 'duckduckgo',
                snippet: (data.AbstractText || '').substring(0, 250)
            });
        }

        if (data.RelatedTopics) {
            for (const item of data.RelatedTopics.slice(0, limit)) {
                if (item.FirstURL) {
                    results.push({
                        title: item.Text || query,
                        url: item.FirstURL,
                        source: 'duckduckgo',
                        snippet: (item.Text || '').substring(0, 250)
                    });
                } else if (item.Topics) {
                    for (const sub of item.Topics.slice(0, 2)) {
                        if (sub.FirstURL) {
                            results.push({
                                title: sub.Text || query,
                                url: sub.FirstURL,
                                source: 'duckduckgo',
                                snippet: (sub.Text || '').substring(0, 250)
                            });
                        }
                    }
                }
            }
        }
        return results.slice(0, limit);
    }

    private async _searchSearXNG(query: string, limit: number): Promise<SearchResult[]> {
        const instances = [...(this.config.searxng.instances || [])];
        // Shuffle instances
        for (let i = instances.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [instances[i], instances[j]] = [instances[j], instances[i]];
        }

        for (const instance of instances.slice(0, 3)) { // Try up to 3 instances
            try {
                // Ensure no trailing slash for the base url then append /search
                const baseUrl = instance.replace(/\/$/, '');
                const url = `${baseUrl}/search`;

                const params = {
                    q: query,
                    format: 'json',
                    language: 'es',
                    safesearch: 0,
                    categories: 'general'
                };

                const { data } = await axios.get(url, {
                    params,
                    timeout: this.config.searxng.timeout * 1000
                });

                const results: SearchResult[] = [];
                if (data.results) {
                    for (const item of data.results.slice(0, limit)) {
                        results.push({
                            title: item.title || 'Untitled',
                            url: item.url,
                            source: 'searxng',
                            snippet: (item.content || '').substring(0, 250)
                        });
                    }
                }
                if (results.length > 0) return results;

            } catch (error) {
                continue;
            }
        }
        return [];
    }

    private async _searchBrave(query: string, limit: number): Promise<SearchResult[]> {
        if (!this.config.brave.key) throw new Error("Brave API key not configured");

        const headers = {
            'X-Subscription-Token': this.config.brave.key,
            'Accept': 'application/json'
        };
        const params = { q: query, count: limit, search_lang: 'es', country: 'es' };
        const { data } = await axios.get(this.config.brave.url, {
            headers,
            params,
            timeout: this.config.brave.timeout * 1000
        });

        const results: SearchResult[] = [];
        if (data.web && data.web.results) {
            for (const item of data.web.results.slice(0, limit)) {
                results.push({
                    title: item.title || 'Untitled',
                    url: item.url,
                    source: 'brave',
                    snippet: (item.description || '').substring(0, 250)
                });
            }
        }
        return results;
    }

    private async _searchYou(query: string, limit: number): Promise<SearchResult[]> {
        if (!this.config.you.key) throw new Error("You.com API key not configured");

        const headers = { 'X-API-Key': this.config.you.key };
        const params = { query: query, num_web_results: limit };
        const { data } = await axios.get(this.config.you.url, {
            headers,
            params,
            timeout: this.config.you.timeout * 1000
        });

        const results: SearchResult[] = [];
        // Note: You.com structure might vary, adapting from python script implies 'web.results' or similar
        // Python script used: data.get('web', {}).get('results', [])
        // IMPORTANT: Verify You.com API response structure if possible, but implementing as per python script logic
        const hits = data.web?.results || data.hits || []; // Fallback trying common structures

        for (const item of hits.slice(0, limit)) {
            results.push({
                title: item.title || 'Untitled',
                url: item.url,
                source: 'you',
                snippet: (item.snippet || item.description || '').substring(0, 250)
            });
        }
        return results;
    }

    private async _searchGoogleCSE(query: string, limit: number): Promise<SearchResult[]> {
        if (!this.config.google_cse.key || !this.config.google_cse.cx) throw new Error("Google CSE config missing");

        const params = {
            key: this.config.google_cse.key,
            cx: this.config.google_cse.cx,
            q: query,
            num: Math.min(limit, 10),
            lr: 'lang_es'
        };
        const { data } = await axios.get(this.config.google_cse.url, {
            params,
            timeout: this.config.google_cse.timeout * 1000
        });

        const results: SearchResult[] = [];
        if (data.items) {
            for (const item of data.items.slice(0, limit)) {
                results.push({
                    title: item.title || 'Untitled',
                    url: item.link,
                    source: 'google_cse',
                    snippet: (item.snippet || '').substring(0, 250)
                });
            }
        }
        return results;
    }

    private async _searchSerpApi(query: string, limit: number): Promise<SearchResult[]> {
        if (!this.config.serpapi.key) throw new Error("SerpAPI key missing");

        const params = {
            api_key: this.config.serpapi.key,
            q: query,
            num: limit,
            engine: 'google',
            hl: 'es',
            gl: 'es'
        };
        const { data } = await axios.get(this.config.serpapi.url, {
            params,
            timeout: this.config.serpapi.timeout * 1000
        });

        const results: SearchResult[] = [];
        if (data.organic_results) {
            for (const item of data.organic_results.slice(0, limit)) {
                results.push({
                    title: item.title || 'Untitled',
                    url: item.link,
                    source: 'serpapi',
                    snippet: (item.snippet || '').substring(0, 250)
                });
            }
        }
        return results;
    }

    private async _searchBing(query: string, limit: number): Promise<SearchResult[]> {
        if (!this.config.bing.key) throw new Error("Bing API key missing");

        const headers = { 'Ocp-Apim-Subscription-Key': this.config.bing.key };
        const params = { q: query, count: limit, offset: 0, mkt: 'es-ES' };
        const { data } = await axios.get(this.config.bing.url, {
            headers,
            params,
            timeout: this.config.bing.timeout * 1000
        });

        const results: SearchResult[] = [];
        if (data.webPages && data.webPages.value) {
            for (const item of data.webPages.value.slice(0, limit)) {
                results.push({
                    title: item.name || 'Untitled',
                    url: item.url,
                    source: 'bing',
                    snippet: (item.snippet || '').substring(0, 250)
                });
            }
        }
        return results;
    }

    // ────────────────────────────────────────────────────────────────────
    // 🧹 UTILS
    // ────────────────────────────────────────────────────────────────────

    private _removeDuplicates(results: SearchResult[]): SearchResult[] {
        const seen = new Set<string>();
        const unique: SearchResult[] = [];

        for (const r of results) {
            try {
                // Parse URL to get hostname (domain)
                // Remove 'www.' for better dedup
                const domain = new URL(r.url).hostname.replace(/^www\./, '');

                if (domain && !seen.has(domain)) {
                    seen.add(domain);
                    unique.push(r);
                }
            } catch (e) {
                // If URL parsing fails, fallback to full URL check or skip
                const simpleUrl = r.url.split('?')[0];
                if (!seen.has(simpleUrl)) {
                    seen.add(simpleUrl);
                    unique.push(r);
                }
            }
        }
        return unique;
    }

    public enableEngine(engine: string) {
        if (this.config[engine]) this.config[engine].enabled = true;
    }

    public disableEngine(engine: string) {
        if (this.config[engine]) this.config[engine].enabled = false;
    }

    public setKey(engine: string, key: string, cx?: string) {
        if (this.config[engine]) {
            this.config[engine].key = key;
            if (cx && this.config[engine].cx !== undefined) {
                this.config[engine].cx = cx;
            }
            this.config[engine].enabled = true;
        }
    }

    public getStats(): SearchStats {
        const stats: SearchStats = {};
        for (const [engine, config] of Object.entries(this.config)) {
            stats[engine] = {
                enabled: config.enabled,
                type: config.type,
                quota: config.quota || 'N/A'
            };
        }
        return stats;
    }

    public clearCache() {
        this.cache.clear();
    }
}
