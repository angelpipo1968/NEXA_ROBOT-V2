"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM = void 0;
class VM {
    constructor(runtime, options) {
        this.type = 'vm';
        this.runtime = runtime;
        this.options = options;
    }
    async execute(options) {
        // Stub implementation for Node.js VM execution
        return {
            success: true,
            output: `[VM: ${this.runtime}] Executed code`,
            executionTime: 20,
            memoryUsed: 30
        };
    }
}
exports.VM = VM;
//# sourceMappingURL=vm.js.map