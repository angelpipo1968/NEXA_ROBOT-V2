import { geminiClient } from '@/lib/gemini';
import { Project, ProjectFile } from '@/store/useProjectStore';
import { saasStarter } from '@/data/webTemplates/saasStarter';

interface GenerationRequest {
    prompt: string;
    complexity: 'simple' | 'moderate' | 'technically_complex';
}

export const WebGenerator = {
    /**
     * Generates a complete project structure based on the user's prompt.
     */
    generateProjectStructure: async (request: GenerationRequest): Promise<ProjectFile[]> => {
        // 0. Check for Templates
        if (request.prompt.toLowerCase().includes('saas') || request.prompt.toLowerCase().includes('starter')) {
            return saasStarter;
        }

        const systemPrompt = `You are an expert Full-Stack Web Architect.
        Your task is to generate a file structure for a web application based on the user's request.
        
        RULES:
        1. Use React (Vite) for Frontend.
        2. Use Node.js (Express) for Backend (if needed).
        3. Prioritize clean, modern code.
        4. Return a JSON array of file objects: { "path": "string", "description": "string" }.
        
        USER REQUEST: "${request.prompt}"
        COMPLEXITY: ${request.complexity}
        
        OUTPUT FORMAT:
        [
            { "path": "src/App.tsx", "description": "Main component" },
            { "path": "package.json", "description": "Dependencies" }
        ]`;

        try {
            const response = await geminiClient.chat({
                message: systemPrompt,
                temperature: 0.2
            });

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            // Basic parsing to extract JSON from potential markdown blocks
            const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Failed to parse project structure");

            const fileStructure = JSON.parse(jsonMatch[0]);

            // For now, we return placeholders. In a real system, we'd generate content for each.
            // But to speed up, we'll generate the core files immediately.
            return await WebGenerator.generateFileContents(fileStructure, request.prompt);
        } catch (error) {
            console.error("Project Generation Error:", error);
            throw error;
        }
    },

    /**
     * Generates content for specific files.
     */
    generateFileContents: async (structure: any[], originalPrompt: string): Promise<ProjectFile[]> => {
        const generatedFiles: ProjectFile[] = [];

        // Limit concurrent generation to avoid rate limits or timeouts, but for now sequential is safer
        for (const file of structure) {
            const fileExtension = file.path.split('.').pop() || 'txt';

            // Skip non-text files or assets for now
            if (['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'].includes(fileExtension)) continue;

            const prompt = `Generate the FULL content for the file "${file.path}" for a web app described as: "${originalPrompt}".
            
            FILE DESCRIPTION: ${file.description}
            
            CONTEXT: This is part of a React (Vite) + Tailwind project.
            
            IMPORTANT:
            - Return ONLY the raw code.
            - Do NOT use markdown code blocks (\`\`\`).
            - Ensure imports (like React) are correct.
            - If it's index.html, ensure it has <div id="root"></div> and imports src/main.tsx.
            `;

            try {
                // Determine complexity-based temperature
                const temperature = file.path.endsWith('.json') || file.path.endsWith('.config.js') ? 0.1 : 0.4;

                const response = await geminiClient.chat({ message: prompt, temperature });
                const data = await response.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                generatedFiles.push({
                    name: file.path.split('/').pop() || '',
                    path: file.path,
                    content: content.replace(/```[a-z]*\n?/g, '').replace(/```/g, ''), // Clean markdown
                    language: fileExtension
                });
            } catch (e) {
                console.error(`Failed to generate ${file.path}`, e);
                // Fallback for critical files
                if (file.path.includes('index.html')) {
                    generatedFiles.push({
                        name: 'index.html',
                        path: 'index.html',
                        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>App</title>\n</head>\n<body>\n<div id="root"></div>\n<script type="module" src="/src/main.tsx"></script>\n</body>\n</html>',
                        language: 'html'
                    });
                }
            }
        }

        return generatedFiles;
    }
};
