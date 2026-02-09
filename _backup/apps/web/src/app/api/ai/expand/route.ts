
import { NextResponse } from 'next/server';
import { NexaAIService } from '../../../../../lib/services/NexaAIService';

// Initialize the service
// Note: In a real app singleton pattern or dependency injection might be better, 
// but for a Next.js API route, creating instance per request or globally is fine.
const aiService = new NexaAIService();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, mode, subMode, opciones } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        let suggestions = [];

        // Mode Dispatcher
        switch (mode) {
            case 'ideas':
                // If subMode is provided (trama, personajes), use it. Default to 'ideas'
                suggestions = await aiService.generarIdeas(text, (subMode as 'ideas' | 'personajes' | 'trama') || 'ideas');
                break;
            case 'investigacion':
                const terminos = aiService.extraerTerminosClave(text);
                if (terminos.length > 0) {
                    suggestions = await aiService.investigarContexto(terminos[0]);
                }
                break;
            case 'imagenes':
                const terminosVisuales = aiService.extraerTerminosVisuales(text);
                if (terminosVisuales.length > 0) {
                    suggestions = await aiService.buscarImagenesInspiracion(terminosVisuales[0]);
                } else {
                    // Fallback if no visual terms found, use general keywords
                    const keywords = aiService.extraerTerminosClave(text);
                    if (keywords.length > 0) {
                        suggestions = await aiService.buscarImagenesInspiracion(keywords[0]);
                    }
                }
                break;
            case 'completo':
                // If user implements "Completo" in UI, we support it here
                suggestions = await aiService.asistenteExpandirCompleto(text, opciones);
                break;
            default:
                suggestions = await aiService.generarIdeas(text, 'general');
        }

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error in AI API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
