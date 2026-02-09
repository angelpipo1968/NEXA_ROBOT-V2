"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessor = void 0;
class DocumentProcessor {
    async process(file) {
        // Stub implementation
        return {
            chunks: [{ content: "Stub content", metadata: { filename: file.name } }],
            metadata: { processed: true }
        };
    }
}
exports.DocumentProcessor = DocumentProcessor;
//# sourceMappingURL=document.js.map