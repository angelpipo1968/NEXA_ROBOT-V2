"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSelector = void 0;
class ModelSelector {
    async select(factors) {
        // Stub: return a default model
        return {
            id: 'stub-model',
            type: 'local',
            dimensions: 384,
            maxTokens: 512,
            languages: ['en'],
            quality: 0.9,
            speed: 1.0
        };
    }
}
exports.ModelSelector = ModelSelector;
//# sourceMappingURL=selector.js.map