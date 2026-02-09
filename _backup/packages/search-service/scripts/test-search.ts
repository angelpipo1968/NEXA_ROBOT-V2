import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import { NexaSearchEngine } from '../src/index';

async function test() {
    console.log('🚀 Initializing NEXA SEARCH CORE v1.0 [Cyberpunk Edition]...');
    const nexa = new NexaSearchEngine();

    // Configuration - Load from Env or Manual for Test
    // nexa.setKey('brave', 'YOUR_KEY');

    console.log('\n[NEXA] Active Motors (Keyless):');
    console.log('  → DuckDuckGo (Unlimited)');
    console.log('  → SearXNG (Unlimited, Multi-instance)');

    const query = "cyberpunk aesthetic design patterns";
    console.log(`\n🔍 Searching: "${query}"`);

    try {
        // First Search (Uncached)
        console.time('Execution Time');
        const results = await nexa.search(query, 8);
        console.timeEnd('Execution Time');

        console.log(`✅ Found ${results.total_results} results in ${results.execution_time}s`);
        console.log(`📡 Sources: ${results.sources_used.join(', ').toUpperCase()}`);

        results.results.forEach((res, index) => {
            console.log(`\n${index + 1}. [${res.source.toUpperCase()}] ${res.title}`);
            console.log(`   🔗 ${res.url}`);
        });

        // Test Cache
        console.log(`\n🔄 Testing Cache with same query...`);
        const startCache = Date.now();
        const cachedResults = await nexa.search(query, 8);
        const cacheDuration = (Date.now() - startCache) / 1000;
        console.log(`⚡ Cached Result Time: ${cacheDuration}s (Should be near 0)`);
        console.log(`   Matches original result count? ${results.total_results === cachedResults.total_results ? 'YES ✅' : 'NO ❌'}`);

        // Stats
        console.log('\n📊 Engine Stats:');
        const stats = nexa.getStats();
        for (const [engine, data] of Object.entries(stats)) {
            const status = data.enabled ? "🟢" : "⚪";
            console.log(`  ${status} ${engine.toUpperCase().padEnd(15)} | Type: ${data.type.padEnd(8)} | Quota: ${JSON.stringify(data.quota)}`);
        }

    } catch (error) {
        console.error('❌ Search failed:', error);
    }
}

test();
