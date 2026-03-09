import { ModelRouter } from './router';

async function testLocal() {
    const router = new ModelRouter();

    console.log("🚀 Iniciando prueba de Razonamiento Local (Nexa SDK)...");

    const request = {
        userId: 'tester',
        message: 'Explícame en un párrafo corto qué es el razonamiento local y por qué es más rápido.',
        priority: 'speed',
        requirements: { modelId: 'nexa-local-qwen' }
    };

    const start = Date.now();
    try {
        // Nota: Esto asume que el servidor nexa serve ya está corriendo en el puerto 3002
        // Si no está corriendo, el NexaProvider devolverá el error capturado.
        const response = await router.route(request as any);
        const duration = Date.now() - start;

        console.log("\n--- RESULTADO NEXA LOCAL ---");
        console.log("Respuesta:", response.text);
        console.log("Latencia Total:", duration, "ms");
        console.log("Tokens:", response.usage?.totalTokens);
        console.log("----------------------------\n");

        if (response.text.includes("Error")) {
            console.log("❌ Parece que el motor local no está encendido. Ve al Dashboard y actívalo primero.");
        } else {
            console.log("✅ Prueba exitosa. ¡La velocidad es increíble!");
        }
    } catch (e: any) {
        console.error("Error en la prueba:", e.message);
    }
}

testLocal();
