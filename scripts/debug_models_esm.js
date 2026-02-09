import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = (process.env.VITE_GEMINI_API_KEY || 'AIzaSyDtxLWiUgN-drPaHhEdwY6kIdyaO9Eh9aQ').trim();

console.log('Using key ending in:', key.slice(-4));

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(r => r.json())
    .then(d => {
        if (d.error) {
            console.error('Error:', JSON.stringify(d.error, null, 2));
            fs.writeFileSync('models_error.json', JSON.stringify(d.error, null, 2));
        } else {
            console.log('Successfully fetched models.');
            const models = d.models?.map(m => m.name) || [];
            fs.writeFileSync('models_list.json', JSON.stringify(models, null, 2));
            console.log('Written to models_list.json');
        }
    })
    .catch(e => {
        console.error('Fetch error:', e);
        fs.writeFileSync('models_exception.txt', e.toString());
    });
