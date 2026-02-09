import { Tool } from './base-tool'
import { ToolResult, ExecutionContext, ToolRoutingResult } from './types'
import { WebSearchTool } from './tools/web-search'
import { CodeExecutionTool } from './tools/code-execution'
import { RAGTool } from './tools/rag'
import {
    SandboxManager,
    PermissionManager,
    BrowserTool,
    CalculatorTool
} from './tools/stubs'

export class ToolOrchestrator {
    private tools: Map<string, Tool>
    private sandbox: SandboxManager
    private permissionManager: PermissionManager

    constructor() {
        this.tools = new Map()
        this.sandbox = new SandboxManager()
        this.permissionManager = new PermissionManager()

        this.registerDefaultTools()
    }

    private registerDefaultTools() {
        this.registerTool(new WebSearchTool())
        this.registerTool(new CodeExecutionTool())
        this.registerTool(new RAGTool())
        this.registerTool(new BrowserTool())
        this.registerTool(new CalculatorTool())
    }

    registerTool(tool: Tool) {
        this.tools.set(tool.name, tool);
    }

    async execute(
        toolName: string,
        params: any,
        context: ExecutionContext
    ): Promise<ToolResult> {
        // 1. Verificar permisos
        const allowed = await this.permissionManager.check(
            context.userId,
            toolName,
            params
        )

        if (!allowed) {
            return {
                success: false,
                error: 'Permission denied',
                data: null,
                metadata: { tool: toolName, blocked: true }
            }
        }

        // 2. Obtener tool
        const tool = this.tools.get(toolName)
        if (!tool) {
            return {
                success: false,
                error: `Tool ${toolName} not found`,
                data: null
            }
        }

        // 3. Validar parámetros
        const validation = tool.validate(params)
        if (!validation.valid) {
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`,
                data: null
            }
        }

        // 4. Ejecutar en sandbox si es necesario
        if (tool.requiresSandbox) {
            return await this.sandbox.execute(tool, params, context)
        }

        // 5. Ejecutar directamente
        try {
            const result = await tool.execute(params, context)

            // 6. Loggear ejecución
            await this.logExecution({
                tool: toolName,
                userId: context.userId,
                params,
                result,
                timestamp: new Date()
            })

            return result
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                data: null,
                metadata: { tool: toolName, error: true }
            }
        }
    }

    async route(
        query: string,
        availableTools: string[],
        context: ExecutionContext
    ): Promise<ToolRoutingResult> {
        // Análisis de intención para routing automático
        const intent = await this.analyzeIntent(query)

        // Selección de herramienta basada en ML
        const selectedTool = await this.selectTool(intent, availableTools, context)

        // Extracción de parámetros
        const params = this.extractParameters(query, selectedTool)

        return {
            tool: selectedTool.name,
            confidence: selectedTool.confidence,
            parameters: params,
            alternativeTools: selectedTool.alternatives
        }
    }

    // Helper methods to satisfy the code structure
    private async logExecution(log: any) {
        console.log('Tool Execution Log:', log);
    }

    private async analyzeIntent(query: string) {
        return { type: 'info_retrieval' };
    }

    private async selectTool(intent: any, availableTools: string[], context: ExecutionContext) {
        // Mock ML selection
        return { name: 'web_search', confidence: 0.95, alternatives: [] };
    }

    private extractParameters(query: string, tool: any) {
        return { query };
    }
}
