"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = exports.FileProcessor = void 0;
class FileProcessor {
    constructor(axios) {
        this.axios = axios;
    }
    async scanDirectory(path, options) { return []; }
    async read(file) { return ""; }
    async write(file, content) { }
}
exports.FileProcessor = FileProcessor;
class BatchProcessor {
    constructor(axios) {
        this.axios = axios;
    }
    async process(items, handler, options) { return { successful: [], failed: [] }; }
}
exports.BatchProcessor = BatchProcessor;
//# sourceMappingURL=processors-stub.js.map