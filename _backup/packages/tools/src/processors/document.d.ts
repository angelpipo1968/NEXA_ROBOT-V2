export interface ProcessedDocument {
    chunks: any[];
    metadata: any;
}
export declare class DocumentProcessor {
    process(file: File): Promise<ProcessedDocument>;
}
//# sourceMappingURL=document.d.ts.map