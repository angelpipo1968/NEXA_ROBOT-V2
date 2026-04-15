import { toolService } from './toolService';
import { geminiClient } from './gemini';

export const DynamicMCPLoader = {
    getSystemPromptWithTools: async (userQuery: string, activeModule: string): Promise<string> => {
        
        // Always load Core Tools
        const activeToolNames = ['sequential_thinking'];
        
        // Load External MCP Config
        let mcpTools: any[] = [];
        try {
            const configRes = await fetch('/mcp_config.json');
            const config = await configRes.json();
            
            // Map common keywords to MCP servers for semantic routing
            const servers = config.mcpServers || {};
            if (userQuery.toLowerCase().includes('notion') && !servers['notion']?.disabled) activeToolNames.push('notion');
            if (userQuery.toLowerCase().includes('slack') && !servers['slack']?.disabled) activeToolNames.push('slack');
            if (userQuery.toLowerCase().includes('book') || userQuery.toLowerCase().includes('story')) activeToolNames.push('nexa_deep_search', 'nexa_analyze_characters', 'nexa_generate_creative_expansion');
            if (userQuery.toLowerCase().includes('zapier')) activeToolNames.push('zapier');
            
            // Note: In a real scenario, we'd fetch actual schemas from the servers.
            // For now, we'll use a mocked directory of MCP tool schemas or fetch them from a discovery endpoint on the backend.
        } catch (e) {
            console.warn('[DynamicMCPLoader] Failed to load mcp_config.json');
        }

        // Semantic Routing using extremely fast LLM inference (gemini-1.5-flash)
        try {
            const prompt = `Analiza la consulta del usuario y determina qué herramientas de la API necesita usar Nexa para resolverla adecuadamente.
Responde ÚNICAMENTE con un JSON Array de strings exactos seleccionando de esta lista: ["search_web", "list_dir", "read_file", "write_file", "save_knowledge", "index_codebase", "codebase_search", "generate_image", "run_script", "read_url_content", "nexa_deep_search", "nexa_analyze_characters", "nexa_generate_creative_expansion"].
Consulta del usuario: "${userQuery}"`;

            const res = await geminiClient.chat({
                message: prompt,
                temperature: 0.1,
                systemInstruction: "Eres un enrutador semántico estricto. Responde solo con un JSON Array válido (ej. [\"search_web\", \"read_file\"]) y sin NINGÚN texto adicional ni formato markdown."
            });
            
            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
            
            // Extract json array cleanly
            const jsonStrMatch = textResponse.match(/\[([\s\S]*?)\]/);
            if (jsonStrMatch) {
                const suggestedTools = JSON.parse(jsonStrMatch[0]);
                if (Array.isArray(suggestedTools)) {
                     activeToolNames.push(...suggestedTools);
                }
            }
        } catch (error) {
            console.error('[DynamicMCPLoader] Fallback a keyword routing por error en LLM:', error);
            // Fallback for extreme cases
            const query = userQuery.toLowerCase();
            if (query.includes('search') || query.includes('web')) activeToolNames.push('search_web');
            if (query.includes('file') || query.includes('code')) activeToolNames.push('list_dir', 'read_file', 'write_file');
            if (query.includes('memory') || query.includes('knowledge')) activeToolNames.push('save_knowledge', 'codebase_search');
            if (query.includes('book') || query.includes('deep')) activeToolNames.push('nexa_deep_search');
        }

        // Match from toolService.definitions
        const functionDeclarations = toolService.definitions[0].function_declarations;
        
        // Mock external schemas if they aren't in toolService.definitions yet
        const externalSchemas = [
            {
                name: "nexa_deep_search",
                description: "Perform a deep, multi-engine search and synthesis for book research. Provides high-quality sources and a summarized analysis.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: { type: "STRING", description: "The research query" },
                        text_context: { type: "STRING", description: "Optional context from the book to refine the search" }
                    },
                    required: ["query"]
                }
            },
            {
                name: "nexa_analyze_characters",
                description: "Extract and analyze characters from a given story text using local intelligence.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        story_text: { type: "STRING", description: "The story text to analyze" }
                    },
                    required: ["story_text"]
                }
            }
        ];

        const allAvailableTools = [...functionDeclarations, ...externalSchemas];
        const selectedTools = allAvailableTools.filter(t => activeToolNames.includes(t.name));
        
        const toolsString = JSON.stringify(selectedTools, null, 2);
        
        return `
HERRAMIENTAS DISPONIBLES (DYNAMIC MCP LOADER):
Puedes usar las siguientes herramientas si las necesitas. Para ejecutar una, debes responder ESTRICTAMENTE con el formato:
:::TOOL_CALL:::{"name": "nombre_herramienta", "args": {"arg1": "valor"}}:::END_TOOL_CALL:::

No pongas NADA MÁS en tu respuesta si estás invocando una herramienta. 
Si invocas una herramienta, espera el resultado antes de generar la respuesta final.
Si no necesitas herramientas, responde normalmente y da el asunto por finalizado.

HERRAMIENTAS CARGADAS PARA ESTE CONTEXTO:
${toolsString}
`;
    }
};

