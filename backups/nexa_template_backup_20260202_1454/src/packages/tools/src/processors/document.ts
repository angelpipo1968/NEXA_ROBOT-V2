export interface ProcessedDocument {
    chunks: any[];
    metadata: any;
}

export class DocumentProcessor {
    async process(file: File): Promise<ProcessedDocument> {
        // Stub implementation
        return {
            chunks: [{ content: "Stub content", metadata: { filename: file.name } }],
            metadata: { processed: true }
        };
    }
}
