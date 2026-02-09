"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSandbox = exports.DockerSandbox = void 0;
class DockerSandbox {
    constructor(image, options) {
        this.type = 'docker';
        this.image = image;
        this.options = options;
    }
    async execute(options) {
        // Stub implementation
        return {
            success: true,
            output: `[Docker: ${this.image}] Executed code in ${options.language}`,
            executionTime: 100,
            memoryUsed: 50
        };
    }
}
exports.DockerSandbox = DockerSandbox;
class DatabaseSandbox {
    constructor(dialect, options) {
        this.type = 'database';
        this.dialect = dialect;
        this.options = options;
    }
    async execute(options) {
        // Stub implementation
        return {
            success: true,
            output: `[Database: ${this.dialect}] Executed SQL query`,
            executionTime: 50,
            memoryUsed: 20
        };
    }
}
exports.DatabaseSandbox = DatabaseSandbox;
//# sourceMappingURL=docker.js.map