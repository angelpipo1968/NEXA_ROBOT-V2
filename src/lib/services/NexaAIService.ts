import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

export class NexaAIService {
    private genAI: GoogleGenerativeAI;
    private braveApiKey: string;

    constructor() {
        this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
        this.braveApiKey = import.meta.env.VITE_BRAVE_API_KEY || '';
    }

    async chat(prompt: string) {
        if (!import.meta.env.VITE_GEMINI_API_KEY) return "Error: API Key missing";
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Error en la síntesis de Nexa.";
        }
    }

    async investigate(query: string) {
        if (!this.braveApiKey) return [];
        try {
            const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Subscription-Token': this.braveApiKey
                }
            });
            return response.data.web?.results || [];
        } catch (error) {
            console.error("Brave Search Error:", error);
            return [];
        }
    }
}
