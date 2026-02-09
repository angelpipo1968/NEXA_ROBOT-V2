// Test script to find working Gemini model
const API_KEY = 'AIzaSyDtxLWiUgN-drPaHhEdwY6kIdyaO9Eh9aQ';

const models = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-exp-1206',
    'gemini-2.0-flash-thinking-exp-1219'
];

async function testModel(model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Hello' }]
                }]
            })
        });

        if (response.ok) {
            console.log(`✅ ${model} - WORKS`);
            return true;
        } else {
            const error = await response.json();
            console.log(`❌ ${model} - ${response.status}: ${error.error?.message || 'Failed'}`);
            return false;
        }
    } catch (err) {
        console.log(`❌ ${model} - Error: ${err.message}`);
        return false;
    }
}

async function findWorkingModel() {
    console.log('Testing Gemini models...\n');
    for (const model of models) {
        await testModel(model);
        await new Promise(r => setTimeout(r, 500)); // Rate limit
    }
}

findWorkingModel();
