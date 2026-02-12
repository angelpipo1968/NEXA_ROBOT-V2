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

        if (functionName === 'generate_image') {
            try {
                const { geminiClient } = await import('./gemini');
                const url = await geminiClient.generateImage(args.prompt);

                // Generate a cinematic review using AI
                const reviewResponse = await geminiClient.chat({
                    message: `Act as a world-class cinematic art critic. Analyze this image prompt and generate a structured JSON review for the "Interactive Review Sheet".
                    
                    PROMPT: "${args.prompt}"
                    
                    Respond ONLY with a JSON object in this format:
                    {
                      "type": "image_review",
                      "title": "Short Epic Title",
                      "description": "One sentence poetic summary of the visual impact",
                      "technicalSpecs": {
                        "resolution": "8K UHD / 300 DPI",
                        "model": "Flux.1 Pro",
                        "seed": "${Math.floor(Math.random() * 999999)}"
                      },
                      "artisticAnalysis": {
                        "lighting": "Description of the lighting style",
                        "composition": "Description of the camera angle and framing",
                        "colorPalette": ["#hex1", "#hex2", "#hex3"],
                        "mood": "Emotional impact"
                      }
                    }`
                });

                const reviewText = await reviewResponse.json();
                const reviewJson = reviewText.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

                // Return a combined string that includes the image and the review
                return `IMAGEN_GENERADA: ${url}\n\n![${args.prompt}](${url})\n\njson_data: ${JSON.stringify({
                    type: 'image_result',
                    url: url,
                    prompt: args.prompt,
                    aspect_ratio: args.aspect_ratio || '1:1',
                    review: JSON.parse(reviewJson.replace(/```json|```/g, '').trim())
                })}`;
            } catch (error) {
                return "Error generating image.";
            }
        }

        return "Unknown tool";
    }
};
