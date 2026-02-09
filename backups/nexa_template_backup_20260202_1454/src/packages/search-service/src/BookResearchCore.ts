
import { NexaSearchEngine } from './NexaSearchEngine';
import { SearchResult, SearchResponse } from './types';

export interface Citations {
    apa: string;
    mla: string;
    raw: SearchResult;
}

export interface ResearchResult {
    context: string;
    query_used: string;
    sources: Citations[];
    raw_results: SearchResult[];
}

export class BookResearchCore extends NexaSearchEngine {
    public researchMode: 'academic' | 'creative' | 'historical';
    public citationFormat: 'apa' | 'mla' | 'chicago';
    public minSourceQuality: number;

    constructor() {
        super();
        this.researchMode = 'academic';
        this.citationFormat = 'apa';
        this.minSourceQuality = 0.8;
    }

    /**
     * Búsqueda enfocada en escritura de libros:
     * - Analiza contexto del texto
     * - Prioriza fuentes académicas
     * - Genera referencias formateadas
     */
    public async researchContext(text: string, maxResults: number = 5): Promise<ResearchResult> {
        // 1. Extraer contexto clave del texto
        const contextKeywords = this._extractKeywords(text);
        let query = `${contextKeywords}`;

        if (this.researchMode === 'academic') {
            query += ' author:academic OR site:.edu OR site:.gov';
        } else if (this.researchMode === 'historical') {
            // Simple heuristic for history
            query += ' history historical';
        }

        // 2. Buscar con enfoque académico (using parent search)
        const response: SearchResponse = await this.search(
            query,
            maxResults * 2, // Fetch more to filter
            false // Not fast mode, we want quality
        );

        // 3. Filtrar por calidad
        const filtered = response.results.filter(r =>
            this._evaluateSourceQuality(r.url) >= this.minSourceQuality
        ).slice(0, maxResults);

        // 4. Generar referencias formateadas
        const formatted = filtered.map(r => this._formatCitation(r));

        return {
            context: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            query_used: query,
            sources: formatted,
            raw_results: filtered
        };
    }

    private _extractKeywords(text: string): string {
        // Simple implementation as requested in Python example (filtering stopwords, length > 4)
        const stopWords = new Set(["the", "and", "for", "with", "this", "that", "from", "la", "el", "los", "las", "y", "en", "de", "que"]);
        const words = text.split(/\s+/);

        return words
            .filter(w => w.length > 4 && !stopWords.has(w.toLowerCase()))
            .slice(0, 5)
            .join(" ");
    }

    private _evaluateSourceQuality(url: string): number {
        try {
            const domain = new URL(url).hostname;
            if (domain.includes(".edu") || domain.includes(".gov")) {
                return 0.95;
            }
            if (domain.includes("wikipedia.org")) {
                return 0.7;
            }
            if (domain.includes("medium.com")) {
                return 0.5;
            }
            return 0.8;
        } catch (e) {
            return 0.5; // Fallback for invalid URLs
        }
    }

    private _formatCitation(result: SearchResult): Citations {
        const date = new Date().toISOString(); // Using current time as search time effectively, ideally we'd use result timestamp if available
        // SearchResult doesn't have timestamp, using current year/date as fallback
        const year = new Date().getFullYear();
        const fullDate = new Date().toISOString().split('T')[0];

        // title() function in python capitalizes first letter of each word.
        const sourceTitle = result.source.charAt(0).toUpperCase() + result.source.slice(1);

        return {
            apa: `${sourceTitle} (${year}). ${result.title}. Recuperado de ${result.url}`,
            mla: `"${result.title}". ${sourceTitle}, ${fullDate}.`,
            raw: result
        };
    }
}
