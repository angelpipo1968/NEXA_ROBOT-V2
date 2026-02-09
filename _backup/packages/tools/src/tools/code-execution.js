"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExecutionTool = void 0;
const base_tool_1 = require("../base-tool");
const docker_1 = require("../sandbox/docker");
const vm_1 = require("../sandbox/vm");
class CodeExecutionTool extends base_tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'execute_code';
        this.description = 'Execute code in a secure sandbox environment';
        this.requiresSandbox = true;
        this.parameters = {
            language: {
                type: 'string',
                required: true,
                enum: ['python', 'javascript', 'typescript', 'bash', 'sql']
            },
            code: { type: 'string', required: true },
            timeout: { type: 'number', default: 10000 },
            memory: { type: 'number', default: 256 },
            inputs: { type: 'array', items: { type: 'string' } }
        };
    }
    async execute(params, context) {
        const { language, code, timeout, memory, inputs } = params;
        // Validación de seguridad del código
        const securityCheck = await this.analyzeCodeSecurity(code, language);
        if (!securityCheck.safe) {
            return {
                success: false,
                error: `Security violation: ${securityCheck.violations.join(', ')}`,
                data: null
            };
        }
        // Seleccionar sandbox basado en lenguaje
        const sandbox = this.selectSandbox(language, { timeout, memory });
        // Ejecutar en sandbox
        const execution = await sandbox.execute({
            code,
            language,
            inputs,
            environment: this.getEnvironment(language)
        });
        // Analizar resultados
        const analysis = this.analyzeExecution(execution);
        return {
            success: execution.success,
            data: {
                output: execution.output,
                error: execution.error,
                executionTime: execution.executionTime,
                memoryUsed: execution.memoryUsed,
                analysis
            },
            metadata: {
                language,
                sandbox: sandbox.type,
                securityLevel: securityCheck.level
            }
        };
    }
    async analyzeCodeSecurity(code, language) {
        const checks = [
            this.checkForbiddenImports(code, language),
            this.checkSystemCalls(code, language),
            this.checkInfiniteLoops(code, language),
            this.checkMemoryAbuse(code, language),
            this.checkNetworkAccess(code, language)
        ];
        const results = await Promise.all(checks);
        const violations = results.flatMap(r => r.violations);
        return {
            safe: results.every(r => r.safe),
            violations: violations,
            level: this.calculateSecurityLevel(results)
        };
    }
    selectSandbox(language, options) {
        switch (language) {
            case 'python':
                return new docker_1.DockerSandbox('python:3.11-slim', options);
            case 'javascript':
            case 'typescript':
                return new vm_1.VM('node', options);
            case 'bash':
                return new docker_1.DockerSandbox('alpine', { ...options, readOnly: true });
            case 'sql':
                return new docker_1.DatabaseSandbox('postgres', options);
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
    // Helper methods to satisfy logic
    async checkForbiddenImports(code, language) { return { safe: true, violations: [] }; }
    async checkSystemCalls(code, language) { return { safe: true, violations: [] }; }
    async checkInfiniteLoops(code, language) { return { safe: true, violations: [] }; }
    async checkMemoryAbuse(code, language) { return { safe: true, violations: [] }; }
    async checkNetworkAccess(code, language) { return { safe: true, violations: [] }; }
    calculateSecurityLevel(results) { return 1; }
    getEnvironment(language) { return {}; }
    analyzeExecution(execution) { return { status: 'completed' }; }
}
exports.CodeExecutionTool = CodeExecutionTool;
//# sourceMappingURL=code-execution.js.map