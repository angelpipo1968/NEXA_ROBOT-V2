"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolOrchestrator = void 0;
const web_search_1 = require("./tools/web-search");
const code_execution_1 = require("./tools/code-execution");
const rag_1 = require("./tools/rag");
const stubs_1 = require("./tools/stubs");
class ToolOrchestrator {
    constructor() {
        this.tools = new Map();
        this.sandbox = new stubs_1.SandboxManager();
        this.permissionManager = new stubs_1.PermissionManager();
        this.registerDefaultTools();
    }
    registerDefaultTools() {
        this.registerTool(new web_search_1.WebSearchTool());
        this.registerTool(new code_execution_1.CodeExecutionTool());
        this.registerTool(new rag_1.RAGTool());
        this.registerTool(new stubs_1.BrowserTool());
        this.registerTool(new stubs_1.CalculatorTool());
    }
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    async execute(toolName, params, context) {
        // 1. Verificar permisos
        const allowed = await this.permissionManager.check(context.userId, toolName, params);
        if (!allowed) {
            return {
                success: false,
                error: 'Permission denied',
                data: null,
                metadata: { tool: toolName, blocked: true }
            };
        }
        // 2. Obtener tool
        const tool = this.tools.get(toolName);
        if (!tool) {
            return {
                success: false,
                error: `Tool ${toolName} not found`,
                data: null
            };
        }
        // 3. Validar parámetros
        const validation = tool.validate(params);
        if (!validation.valid) {
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`,
                data: null
            };
        }
        // 4. Ejecutar en sandbox si es necesario
        if (tool.requiresSandbox) {
            return await this.sandbox.execute(tool, params, context);
        }
        // 5. Ejecutar directamente
        try {
            const result = await tool.execute(params, context);
            // 6. Loggear ejecución
            await this.logExecution({
                tool: toolName,
                userId: context.userId,
                params,
                result,
                timestamp: new Date()
            });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                data: null,
                metadata: { tool: toolName, error: true }
            };
        }
    }
    async route(query, availableTools, context) {
        // Análisis de intención para routing automático
        const intent = await this.analyzeIntent(query);
        // Selección de herramienta basada en ML
        const selectedTool = await this.selectTool(intent, availableTools, context);
        // Extracción de parámetros
        const params = this.extractParameters(query, selectedTool);
        return {
            tool: selectedTool.name,
            confidence: selectedTool.confidence,
            parameters: params,
            alternativeTools: selectedTool.alternatives
        };
    }
    // Helper methods to satisfy the code structure
    async logExecution(log) {
        console.log('Tool Execution Log:', log);
    }
    async analyzeIntent(query) {
        return { type: 'info_retrieval' };
    }
    async selectTool(intent, availableTools, context) {
        // Mock ML selection
        return { name: 'web_search', confidence: 0.95, alternatives: [] };
    }
    extractParameters(query, tool) {
        return { query };
    }
}
exports.ToolOrchestrator = ToolOrchestrator;
//# sourceMappingURL=orchestrator.js.map