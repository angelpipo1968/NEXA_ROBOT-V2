import { tavilyClient } from './tavily';

const BACKEND_URL = 'http://localhost:3001/api/tools/execute';

export const toolService = {
    // Tool Definitions for Gemini
    definitions: [
        {
            function_declarations: [
                {
                    name: "search_web",
                    description: "Search the web for real-time information, news, or facts.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            query: { type: "STRING", description: "The search query" }
                        },
                        required: ["query"]
                    }
                },
                {
                    name: "generate_image",
                    description: "Generate a high-quality image based on a descriptive prompt.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            prompt: { type: "STRING", description: "The detailed description of the image to generate" },
                            aspect_ratio: { type: "STRING", enum: ["1:1", "16:9", "9:16"], description: "The aspect ratio of the image" }
                        },
                        required: ["prompt"]
                    }
                },
                {
                    name: "sequential_thinking",
                    description: "A detailed tool for recursive and reflective problem-solving. Use this to break down complex tasks into manageable steps.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            thought: { type: "STRING", description: "The current thinking step" },
                            thoughtNumber: { type: "NUMBER", description: "The step number" },
                            totalThoughts: { type: "NUMBER", description: "Estimated total steps" },
                            nextThoughtNeeded: { type: "BOOLEAN", description: "Whether another thought step is needed" }
                        },
                        required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
                    }
                },
                {
                    name: "list_dir",
                    description: "List the contents of a directory in the project.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            path: { type: "STRING", description: "The relative path (e.g. '.', './src')" },
                            recursive: { type: "BOOLEAN", description: "Whether to list subdirectories" }
                        },
                        required: ["path"]
                    }
                },
                {
                    name: "read_file",
                    description: "Read the content of a file in the project.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            path: { type: "STRING", description: "The relative path to the file" }
                        },
                        required: ["path"]
                    }
                },
                {
                    name: "write_file",
                    description: "Write or update a file in the project.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            path: { type: "STRING", description: "The relative path to the file" },
                            content: { type: "STRING", description: "The text content to write" }
                        },
                        required: ["path", "content"]
                    }
                },
                {
                    name: "save_knowledge",
                    description: "Save a piece of knowledge, a lesson learned, or architectural documentation to the project memory.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING", description: "A short, descriptive title" },
                            content: { type: "STRING", description: "The detailed knowledge, guide, or documentation" },
                            category: { type: "STRING", enum: ["architecture", "api", "style", "fix", "workflow"], description: "The category" },
                            tags: { type: "ARRAY", items: { type: "STRING" }, description: "Keywords" }
                        },
                        required: ["title", "content", "category"]
                    }
                },
                {
                    name: "index_codebase",
                    description: "Initializes or updates the semantic index of your codebase. Required for semantic search.",
                    parameters: { type: "OBJECT", properties: {} }
                },
                {
                    name: "codebase_search",
                    description: "Search for logic, modules, or features across the entire project using natural language.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            query: { type: "STRING", description: "Search query (e.g. 'how is authentication handled?')" }
                        },
                        required: ["query"]
                    }
                },
                {
                    name: "create_artifact",
                    description: "DEPRECATED: Use write_file for actual project files. Use this ONLY for ephemeral UI previews.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            filename: { type: "STRING", description: "The name of the file" },
                            language: { type: "STRING", description: "The programming language" },
                            content: { type: "STRING", description: "The content" }
                        },
                        required: ["filename", "language", "content"]
                    }
                }
            ]
        }
    ],

    // Execution Logic
    execute: async (functionName: string, args: any) => {
        const { useChatStore } = await import('@/store/useChatStore');
        const addLog = useChatStore.getState().addTerminalLog;

        console.log(`[ToolService] 🛠️ Executing: ${functionName}`, args);
        addLog(`Executing ${functionName} with ${JSON.stringify(args)}`);

        // Core Frontend Tools
        if (functionName === 'search_web') {
            const results = await tavilyClient.search({ query: args.query });
            if (!results) return "Error performing search.";
            return JSON.stringify(results.map((r: any) => ({ title: r.title, content: r.content, url: r.url })));
        }

        if (functionName === 'generate_image') {
            try {
                const { geminiClient } = await import('./gemini');
                const url = await geminiClient.generateImage(args.prompt);
                return `IMAGEN_GENERADA: ${url}\n\n![${args.prompt}](${url})`;
            } catch (error) {
                return "Error generating image.";
            }
        }

        if (functionName === 'sequential_thinking') {
            return `PENSAMIENTO REGISTRADO (${args.thoughtNumber}/${args.totalThoughts}): ${args.thought}`;
        }

        if (functionName === 'create_artifact') {
            return JSON.stringify({ name: args.filename, content: args.content, language: args.language, status: 'success' });
        }

        // Project/System Tools (Delegate to Backend)
        if (['save_knowledge', 'list_dir', 'read_file', 'write_file', 'index_codebase', 'codebase_search'].includes(functionName)) {
            try {
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tool: functionName,
                        params: args,
                        userId: 'local-user'
                    })
                });

                const data = await response.json();
                if (data.success) {
                    addLog(`Success: ${functionName}`);
                    return typeof data.result.data === 'string'
                        ? data.result.data
                        : JSON.stringify(data.result.data, null, 2);
                } else {
                    return `Error: ${data.error || 'Unknown backend error'}`;
                }
            } catch (e: any) {
                addLog(`Error: ${functionName} - ${e.message}`);
                return `Error connecting to backend for tool ${functionName}. Make sure the API server is running on port 3001.`;
            }
        }

        return "Unknown tool";
    }
};
