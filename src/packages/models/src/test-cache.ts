import { StreamingCache } from './cache/stream-cache';
import { StreamChunk } from './types';

async function testCache() {
    const cache = new StreamingCache();
    const prompt = "Dime hola en 3 idiomas.";

    async function* mockGenerator(): AsyncIterable<StreamChunk> {
        yield { text: "Hola, ", done: false };
        yield { text: "Hello, ", done: false };
        yield { text: "Bonjour!", done: true };
    }

    console.log('--- Primera ejecución (Cache Miss) ---');
    const start1 = Date.now();
    for await (const chunk of cache.getOrStream(prompt, mockGenerator())) {
        process.stdout.write(chunk.text);
    }
    console.log(`\nLatencia 1: ${Date.now() - start1}ms`);

    console.log('\n\n--- Segunda ejecución (Cache Hit) ---');
    const start2 = Date.now();
    for await (const chunk of cache.getOrStream(prompt, mockGenerator())) {
        process.stdout.write(chunk.text);
    }
    console.log(`\nLatencia 2: ${Date.now() - start2}ms`);
}

testCache();
