export type SearchSource = 'brave' | 'duckduckgo' | 'google_cse' | 'bing' | 'serpapi' | 'searxng' | 'you';
export type SearchEngineType = 'official' | 'public';

export interface SearchResult {
    title: string;
    url: string;
    source: SearchSource;
    snippet: string;
}

export interface SearchQuota {
    daily?: number;
    monthly?: number;
    used: number;
    reset?: string | null; // ISO string date
}

export interface SearchProviderConfig {
    enabled: boolean;
    type: SearchEngineType;
    url: string;
    key?: string;
    cx?: string;
    instances?: string[]; // For SearXNG
    timeout: number; // in seconds
    cooldown?: number; // in seconds
    quota?: SearchQuota;
}

export interface SearchStats {
    [key: string]: {
        enabled: boolean;
        type: SearchEngineType;
        quota: SearchQuota | 'N/A';
    }
}

export interface SearchResponse {
    query: string;
    timestamp: string;
    execution_time: number; // in seconds
    total_results: number;
    sources_used: SearchSource[];
    results: SearchResult[];
}

export interface CacheEntry {
    timestamp: number; // Unix timestamp
    data: SearchResponse;
}
