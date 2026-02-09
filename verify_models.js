import fs from 'node:fs';
import path from 'node:path';

// Read .env.local manually
let apiKey = '';
try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    const match = envLocal.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
        // Remove quotes if present
        if (apiKey.startsWith('"') && apiKey.endsWith('"')) apiKey = apiKey.slice(1, -1);
        if (apiKey.startsWith("'") && apiKey.endsWith("'")) apiKey = apiKey.slice(1, -1);
    }
} catch (e) {
    console.error('Could not read .env.local', e.message);
}

if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

const models = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        const start = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });
        const duration = Date.now() - start;

        if (response.ok) {
            console.log(`✅ ${modelName}: Success (${duration}ms)`);
            return true;
        } else {
            const errText = await response.text();
            console.error(`❌ ${modelName}: Failed (${response.status}) - ${errText.slice(0, 100)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${modelName}: Error - ${error.message}`);
        return false;
    }
}

async function run() {
    console.log(`🔑 Using Key start: ${apiKey.slice(0, 4)}... end: ...${apiKey.slice(-4)}`);
    console.log('--- Model Verification ---');

    for (const model of models) {
        await testModel(model);
    }
}

run();
