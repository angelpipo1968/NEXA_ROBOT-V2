"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
class EmbeddingService {
    async embed(chunks) {
        // Stub implementation returning mock vector
        return chunks.map(() => Array(1536).fill(0.1));
    }
}
exports.EmbeddingService = EmbeddingService;
//# sourceMappingURL=embedding.js.map