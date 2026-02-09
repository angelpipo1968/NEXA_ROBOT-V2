import fs from 'node:fs';

console.log('--- Debugging Environment ---');

let apiKey = '';
try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    console.log('.env.local found, size:', envLocal.length);

    const targetKey = 'VITE_GEMINI_API_KEY';
    const lines = envLocal.split('\n');
    const line = lines.find(l => l.startsWith(targetKey));

    if (line) {
        console.log('Found line:', line.substring(0, 25) + '...');
        const parts = line.split('=');
        if (parts.length >= 2) {
            apiKey = parts.slice(1).join('=').trim();
            // Remove quotes
            if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                apiKey = apiKey.slice(1, -1);
            }
            console.log('Parsed Key length:', apiKey.length);
            console.log('Key start/end:', apiKey.slice(0, 4), '...', apiKey.slice(-4));
        }
    } else {
        console.error('Line starting with', targetKey, 'not found');
    }

} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!apiKey) {
    console.error('Please verify .env.local has VITE_GEMINI_API_KEY');
    process.exit(1);
}

// List models to verify connectivity
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
console.log('\nFetching models...');

fetch(url)
    .then(async res => {
        console.log('Status:', res.status, res.statusText);
        if (!res.ok) {
            const txt = await res.text();
            console.error('Error body:', txt.slice(0, 500));
        } else {
            const data = await res.json();
            console.log('Models found:', data.models?.length || 0);
            if (data.models) {
                console.log('First 5 models:', data.models.slice(0, 5).map(m => m.name));
            }
        }
    })
    .catch(e => console.error('Fetch error:', e));
