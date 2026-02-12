import { MCPServerInfo, MCPTool } from '../types/mcp';
// @ts-ignore - Importing from root might need config adjustment or symlink in a real build
// But for this agentic task, we'll assume we can bridge this data.
import mcpConfig from '../../mcp_config.json';

class MCPService {
    private static instance: MCPService;
    private servers: MCPServerInfo[] = [];

    // Pre-seeded tools for popular MCP servers since we can't discover them at runtime yet
    private toolRegistry: Record<string, MCPTool[]> = {
        'slack': [
            { name: 'list_channels', description: 'List all public channels in the workspace', parameters: {} },
            { name: 'post_message', description: 'Post a message to a channel', parameters: { channel: 'string', text: 'string' } },
            { name: 'get_channel_history', description: 'Fetch messages from a channel', parameters: { channel: 'string' } }
        ],
        'github': [
            { name: 'search_repositories', description: 'Search for GitHub repositories', parameters: { query: 'string' } },
            { name: 'get_file_contents', description: 'Get content of a file from a repo', parameters: { owner: 'string', repo: 'string', path: 'string' } },
            { name: 'create_issue', description: 'Create a new issue', parameters: { owner: 'string', repo: 'string', title: 'string', body: 'string' } }
        ],
        'google-drive': [
            { name: 'list_files', description: 'List files in Google Drive', parameters: {} },
            { name: 'read_file', description: 'Read a file by ID', parameters: { fileId: 'string' } }
        ],
        'vercel-mcp': [
            { name: 'list_deployments', description: 'List latest Vercel deployments', parameters: {} },
            { name: 'get_project', description: 'Get details of a project', parameters: { id: 'string' } }
        ],
        'n8n-mcp': [
            { name: 'execute_workflow', description: 'Trigger an n8n workflow', parameters: { id: 'string', data: 'object' } }
        ]
    };

    private constructor() {
        this.initialize();
    }

    public static getInstance(): MCPService {
        if (!MCPService.instance) {
            MCPService.instance = new MCPService();
        }
        return MCPService.instance;
    }

    private initialize() {
        if (!mcpConfig || !mcpConfig.mcpServers) return;

        this.servers = Object.entries(mcpConfig.mcpServers).map(([id, config]: [string, any]) => ({
            id,
            name: this.formatName(id),
            status: 'active', // Assume active if in config for now
            type: config.url ? 'http' : 'process',
            config: config,
            tools: this.toolRegistry[id] || []
        }));
    }

    private formatName(id: string): string {
        return id.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    public getServers(): MCPServerInfo[] {
        return this.servers;
    }

    public getServerById(id: string): MCPServerInfo | undefined {
        return this.servers.find(s => s.id === id);
    }

    public getAllTools(): (MCPTool & { serverId: string })[] {
        return this.servers.flatMap(server =>
            server.tools.map(tool => ({ ...tool, serverId: server.id }))
        );
    }
}

export const mcpService = MCPService.getInstance();
