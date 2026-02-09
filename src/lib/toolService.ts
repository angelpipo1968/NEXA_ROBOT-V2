import { tavilyClient } from './tavily';

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
                    name: "create_artifact",
                    description: "Create a code file or document for the user to download.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            filename: { type: "STRING", description: "Name of the file (e.g., index.html, notes.txt)" },
                            content: { type: "STRING", description: "The content of the file" },
                            language: { type: "STRING", description: "Programming language or format (e.g., html, javascript, markdown)" }
                        },
                        required: ["filename", "content"]
                    }
                }
            ]
        }
    ],

    // Execution Logic
    execute: async (functionName: string, args: any) => {
        console.log(`Executing tool: ${functionName}`, args);

        if (functionName === 'search_web') {
            const results = await tavilyClient.search({ query: args.query });
            if (!results) return "Error performing search.";
            return JSON.stringify(results.map((r: any) => ({ title: r.title, content: r.content, url: r.url })));
        }

        if (functionName === 'create_artifact') {
            // Return a JSON string that the store can parse
            return JSON.stringify({
                name: args.filename,
                content: args.content,
                language: args.language,
                status: 'success'
            });
        }

        return "Unknown tool";
    }
};
