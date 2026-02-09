import { OllamaProvider } from './providers/stubs';

async function testOllama() {
    const provider = new OllamaProvider();
    console.log('Available models:', provider.getModels().map(m => m.id));

    console.log('\nTesting chat with Llama 3.2 3B...');
    const response = await provider.execute({
        userId: 'test-user',
        message: 'Hola, ¿puedes presentarte brevemente?'
    });

    console.log('\nAI Response:', response.text);
    console.log('\nMetrics:', {
        latency: `${response.latency}ms`,
        usage: response.usage
    });
}

testOllama().catch(console.error);
