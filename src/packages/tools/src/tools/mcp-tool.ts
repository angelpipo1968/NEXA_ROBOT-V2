import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
import { MCPClient, MCPConfig } from '../mcp-client';

export class GenericMCPTool extends Tool {
    name: string;
    description: string;
    parameters: any;
    private mcpClient: MCPClient;
    private config: MCPConfig;
    private toolNameInServer: string;

    constructor(
        serverName: string,
        toolName: string,
        description: string,
        params: any,
        config: MCPConfig,
        client: MCPClient
    ) {
        super();
        this.name = `${serverName}_${toolName}`;
        this.toolNameInServer = toolName;
        this.description = description;
        this.parameters = params;
        this.config = config;
        this.mcpClient = client;
    }

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        try {
            console.log(`[MCP] Calling tool ${this.toolNameInServer} on ${this.name}`);
            const response: any = await this.mcpClient.callTool(
                this.name.split('_')[0],
                this.config,
                'tools/call',
                {
                    name: this.toolNameInServer,
                    arguments: params
                }
            );

            if (response.error) {
                return {
                    success: false,
                    error: response.error.message || 'Unknown MCP error',
                    data: null
                };
            }

            return {
                success: true,
                data: response.result?.content || response.result,
                metadata: { source: 'mcp', server: this.name.split('_')[0] }
            };
        } catch (error: any) {
            return {
                success: false,
                error: `MCP Execution failed: ${error.message}`,
                data: null
            };
        }
    }
}
