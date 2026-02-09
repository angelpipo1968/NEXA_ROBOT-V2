import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error("Error loading env:", e);
        return {};
    }
}

async function testGroq() {
    const env = loadEnv();
    const apiKey = env.VITE_GROQ_API_KEY;

    console.log("Testing with API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
        console.error("No API Key found in .env.local");
        return;
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say "Groq is working" if you can read this.' }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("----------------------------------------");
            console.log("Status: SUCCESS");
            console.log("Response:", data.choices[0].message.content);
            console.log("----------------------------------------");
        } else {
            console.error("----------------------------------------");
            console.error("Status: FAILED");
            console.error("Error:", JSON.stringify(data, null, 2));
            console.error("----------------------------------------");
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

testGroq();
