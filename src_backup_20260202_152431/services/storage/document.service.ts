import { supabase } from '@/lib/supabase/client';
import { VectorStoreService } from '../memory/vector-store.service';

export class DocumentService {
    private vectorStore: VectorStoreService;

    constructor() {
        this.vectorStore = new VectorStoreService();
    }

    async uploadDocument(
        userId: string,
        file: File,
        collection: string = 'documents'
    ): Promise<string> {
        // Subir a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${collection}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        // Procesar contenido según tipo
        const content = await this.extractContent(file);

        // Almacenar en base de datos
        const { data, error: dbError } = await supabase
            .from('documents')
            .insert({
                user_id: userId,
                filename: file.name,
                file_type: file.type,
                file_size: file.size,
                content,
                metadata: {
                    storage_path: filePath,
                    original_name: file.name
                }
            })
            .select('id')
            .single();

        if (dbError) throw new Error(`Database error: ${dbError.message}`);

        // Procesar para RAG en background
        this.processForRAG(userId, data.id, content, collection);

        return data.id;
    }

    private async extractContent(file: File): Promise<string> {
        const textTypes = ['text/plain', 'text/markdown', 'application/json'];
        const pdfTypes = ['application/pdf'];

        if (textTypes.includes(file.type)) {
            return await file.text();
        }

        // Fallback for binaries or un-parseable types in browser
        return `[Archivo binario no procesado: ${file.name}]`;
    }

    private async processForRAG(
        userId: string,
        documentId: string,
        content: string,
        collection: string
    ): Promise<void> {
        // Dividir en chunks
        const chunks = this.splitIntoChunks(content, 1000, 200);

        // Procesar cada chunk
        for (const chunk of chunks) {
            await this.vectorStore.storeMemory(
                userId,
                chunk,
                `document_${documentId}`,
                {
                    document_id: documentId,
                    chunk_index: chunks.indexOf(chunk),
                    collection
                }
            );
        }

        // Marcar como procesado
        await supabase
            .from('documents')
            .update({
                processed: true,
                chunks: chunks,
                summary: await this.generateSummary(content)
            })
            .eq('id', documentId);
    }

    private splitIntoChunks(
        text: string,
        chunkSize: number,
        overlap: number
    ): string[] {
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            const end = start + chunkSize;
            const chunk = text.substring(start, Math.min(end, text.length));
            chunks.push(chunk);
            start += chunkSize - overlap;
        }

        return chunks;
    }

    private async generateSummary(text: string): Promise<string> {
        try {
            // Usar IA para generar resumen
            const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2:3b',
                    prompt: `Resume este texto en 100 palabras: ${text.substring(0, 2000)}`,
                    stream: false
                })
            });

            const data = await response.json();
            return data.response || '';
        } catch (e) {
            console.warn('Failed to generate summary', e);
            return '';
        }
    }
}
