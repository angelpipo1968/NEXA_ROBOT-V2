import fs from 'node:fs';

let apiKey = '';
try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    const match = envLocal.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match && match[1]) {
        apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
    }
} catch (e) { }

if (!apiKey) process.exit(1);

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
})
    .then(res => res.ok ? console.log('SUCCESS') : console.log('FAIL ' + res.status))
    .catch(err => console.log('ERROR ' + err.message));
