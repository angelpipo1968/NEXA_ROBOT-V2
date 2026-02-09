import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message, deepThink } = await request.json();

        // 1. Try to use Real Gemini API if key is present
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            try {
                // Determine model based on capability (Gemini Pro is standard)
                const model = "gemini-pro";
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                // Construct prompt with context if needed, for now simple 1-turn
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: message }] }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (text) {
                        return NextResponse.json({
                            response: text,
                            tokens: text.length / 4,
                            model: "Gemini-Pro"
                        });
                    }
                }
                console.warn("Gemini API returned error or empty, falling back to simulation", response.status);
            } catch (e) {
                console.error("Gemini API Call Failed", e);
            }
        }

        // 2. Fallback to Simulation if no key or error
        await new Promise(resolve => setTimeout(resolve, deepThink ? 2000 : 800));
        let responseText = "He recibido tu mensaje, pero no he podido conectar con la Inteligencia Artificial de Google. Verifica tu API Key.";

        // Basic Simulation Keywords
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hola')) {
            responseText = "¡Hola! Soy NEXA, potenciada por Gemini. ¿En qué puedo ayudarte hoy?";
        }

        return NextResponse.json({
            response: responseText,
            tokens: responseText.length / 4,
            model: "Nexa-Fallback-Sim"
        });

    } catch (error) {
        console.error('Core API Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
