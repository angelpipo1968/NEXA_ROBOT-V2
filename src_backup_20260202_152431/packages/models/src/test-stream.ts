import { ModelRouter } from './router';

async function testStreaming() {
    const router = new ModelRouter();
    const request = {
        userId: 'test-user',
        message: 'Escribe un poema corto sobre la inteligencia artificial.',
        requirements: { modelId: 'llama3.2:3b' }
    };

    console.log('🚀 Iniciando stream con Ollama (llama3.2:3b)...');

    try {
        for await (const chunk of router.stream(request)) {
            process.stdout.write(chunk.text);
            if (chunk.done) {
                console.log('\n\n✅ Stream finalizado');
                console.log('Usage:', chunk.usage);
            }
        }
    } catch (error) {
        console.error('❌ Error en el stream:', error);
    }
}

testStreaming();
