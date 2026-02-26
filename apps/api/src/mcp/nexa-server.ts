import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError
} from "@modelcontextprotocol/sdk/types.js";
import { BookResearchCore } from "@nexa/search-service";
import { ModelRouter } from "@nexa/models";
import { SearchResult } from "../../../src/packages/search-service/src/types";

class NexaMcpServer {
    private server: Server;
    private research: BookResearchCore;
    private router: ModelRouter;

    constructor() {
        this.server = new Server({
            name: "nexa-engine",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });

        this.research = new BookResearchCore();
        this.router = new ModelRouter();

        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "nexa_deep_search",
                    description: "Perform a deep, multi-engine search and synthesis for book research. Provides high-quality sources and a summarized analysis.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "The research query" },
                            text_context: { type: "string", description: "Optional context from the book to refine the search" }
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "nexa_analyze_characters",
                    description: "Extract and analyze characters from a given story text using local intelligence.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            story_text: { type: "string", description: "The story text to analyze" }
                        },
                        required: ["story_text"],
                    },
                },
                {
                    name: "nexa_generate_creative_expansion",
                    description: "Expand on a story idea or plot point using the Nexa local model. Optimized for creative writing.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            prompt: { type: "string", description: "The idea or scene to expand" },
                            style: { type: "string", enum: ["dark", "vibrant", "minimalist", "classic"], default: "vibrant" }
                        },
                        required: ["prompt"],
                    },
                }
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
            try {
                switch (request.params.name) {
                    case "nexa_deep_search": {
                        const query = request.params.arguments?.query as string;
                        const context = request.params.arguments?.text_context as string || "";
                        const result = await this.research.researchContext(context || query);
                        return {
                            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                        };
                    }

                    case "nexa_analyze_characters": {
                        const text = request.params.arguments?.story_text as string;
                        const analysisPrompt = `Analiza los personajes de este texto: "${text.substring(0, 3000)}". Devuelve JSON con nombres, roles y rasgos.`;
                        const result = await this.router.route({
                            userId: "mcp-system",
                            message: analysisPrompt,
                            priority: "quality"
                        });
                        return {
                            content: [{ type: "text", text: result.text }],
                        };
                    }

                    case "nexa_generate_creative_expansion": {
                        const prompt = request.params.arguments?.prompt as string;
                        const style = request.params.arguments?.style as string;
                        const expansionPrompt = `Actúa como un escritor de élite. Estilo: ${style}. Expande la siguiente idea con una prosa rica y evocadora:\n\n${prompt}`;
                        const result = await this.router.route({
                            userId: "mcp-system",
                            message: expansionPrompt,
                            priority: "balanced"
                        });
                        return {
                            content: [{ type: "text", text: result.text }],
                        };
                    }

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error en Nexa Engine: ${error.message}` }],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Nexa MCP Server running on stdio");
    }
}

const server = new NexaMcpServer();
server.run().catch(console.error);
