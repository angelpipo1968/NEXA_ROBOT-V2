import { Tool } from '../base-tool'
import { ExecutionContext, ToolResult } from '../types'

export class ReadUrlTool extends Tool {
    name = 'read_url_content'
    description = 'Fetch and read the raw text content of a specific URL. Useful for deep research when you need to read an entire article instead of just search snippets.'
    parameters = {
        url: { type: 'string', required: true }
    }

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        try {
            const response = await fetch(params.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NexaAgent'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const html = await response.text();
            
            // Basic HTML to Text parsing
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const content = bodyMatch ? bodyMatch[1] : html;
            
            const text = content
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
                
            return {
                success: true,
                data: text.substring(0, 100000) // Prevent huge payloads
            }
        } catch (error: any) {
             return {
                success: false,
                error: `Failed to fetch URL: ${error.message}`,
                data: null
             }
        }
    }
}
