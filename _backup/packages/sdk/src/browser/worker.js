"use strict";
// Basic worker implementation for off-thread processing
// Note: In a real build, this would need to be bundled separately or handled by a bundler plugin.
// For now, we provide the raw source.
self.addEventListener('message', async (event) => {
    const { id, type, text, options } = event.data;
    if (type === 'embed') {
        try {
            // In a real scenario, this would load a WASM model or make an API call
            // For this SDK wrapper, we'll simulate processing or proxy the API call if we had the logic here.
            // Since we can't easily import the main SDK here without bundling, 
            // we will simulate a "processed" state or just return an echo for demonstration
            // unless we have a specific WASM embedding library available.
            // Mocking successful processing for now as requested by the architecture
            // In production, this would use @xenova/transformers or similar.
            const result = {
                embeddings: Array(384).fill(0).map(() => Math.random()),
                model: options.modelId || 'local-model'
            };
            self.postMessage({ id, result });
        }
        catch (error) {
            self.postMessage({ id, error: error.message });
        }
    }
});
//# sourceMappingURL=worker.js.map