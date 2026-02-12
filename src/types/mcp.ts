export interface MCPServerConfig {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    headers?: Record<string, string>;
}

export interface MCPTool {
    name: string;
    description: string;
    parameters: any;
}

export interface MCPServerInfo {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'error';
    type: 'process' | 'http';
    tools: MCPTool[];
    config: MCPServerConfig;
}
