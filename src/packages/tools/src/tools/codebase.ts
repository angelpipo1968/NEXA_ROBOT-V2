import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CodebaseSearchTool extends Tool {
    name = 'codebase_search';
    description = 'Search the entire codebase using semantic meaning (embeddings). Finds relevant files and functions even if names don\'t match exactly.';
    parameters = {
        query: { type: 'string', description: 'What are you looking for? (e.g. "auth logic", "payment processing", "ui components")' }
    };

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        const { query } = params;
        const indexPath = path.join(process.cwd(), '.nexa', 'code-index.json');

        try {
            // Check if index exists
            let indexData: any[] = [];
            try {
                const data = await fs.readFile(indexPath, 'utf-8');
                indexData = JSON.parse(data);
            } catch (e) {
                return {
                    success: false,
                    error: "Codebase index not found. Please run 'index_codebase' first to enable semantic search.",
                    data: null
                };
            }

            // 1. Get embedding for the query
            // We'll call the local API for this
            const embeddingResponse = await fetch('http://localhost:3001/api/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: query })
            });

            if (!embeddingResponse.ok) {
                throw new Error('Failed to get query embedding via API');
            }

            const { embeddings } = await embeddingResponse.json();
            const queryVector = embeddings[0];

            // 2. Perform Cosine Similarity
            const results = indexData.map(item => {
                const similarity = this.cosineSimilarity(queryVector, item.embedding);
                return { path: item.path, similarity, preview: item.preview };
            })
                .sort((a, b) => b.similarity - a.similarity)
                .filter(item => item.similarity > 0.6) // Threshold
                .slice(0, 5);

            return {
                success: true,
                data: {
                    query,
                    results: results.map(r => ({
                        file: r.path,
                        relevance: Math.round(r.similarity * 100) + '%',
                        preview: r.preview
                    }))
                }
            };

        } catch (error: any) {
            return {
                success: false,
                error: `Semantic search failed: ${error.message}`,
                data: null
            };
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export class IndexCodebaseTool extends Tool {
    name = 'index_codebase';
    description = 'Indexes the codebase for semantic search. This reads files and generates embeddings.';
    parameters = {};

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        const root = process.cwd();
        const ignoreDirs = ['node_modules', '.git', '.nexa', 'dist', 'build', '.next'];
        const allowedExts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md'];
        const index: any[] = [];

        try {
            const files = await this.getAllFiles(root, ignoreDirs, allowedExts);

            // Process in batches to avoid overwhelming the API
            const batchSize = 10;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const contents = await Promise.all(batch.map(f => fs.readFile(f, 'utf-8')));

                const response = await fetch('http://localhost:3001/api/embeddings/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts: contents })
                });

                if (response.ok) {
                    const { embeddings } = await response.json();
                    batch.forEach((filePath, idx) => {
                        index.push({
                            path: path.relative(root, filePath),
                            embedding: embeddings[idx],
                            preview: contents[idx].slice(0, 200) + '...'
                        });
                    });
                }
            }

            const nexaDir = path.join(root, '.nexa');
            await fs.mkdir(nexaDir, { recursive: true });
            await fs.writeFile(path.join(nexaDir, 'code-index.json'), JSON.stringify(index), 'utf-8');

            return {
                success: true,
                data: {
                    message: `Successfully indexed ${index.length} files. Semantic search is now active.`,
                    filesIndexed: index.length
                }
            };

        } catch (error: any) {
            return {
                success: false,
                error: `Indexing failed: ${error.message}`,
                data: null
            };
        }
    }

    private async getAllFiles(dir: string, ignore: string[], exts: string[]): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                if (ignore.includes(entry.name)) return [];
                return this.getAllFiles(res, ignore, exts);
            } else {
                if (exts.includes(path.extname(entry.name))) return [res];
                return [];
            }
        }));
        return files.flat();
    }
}
