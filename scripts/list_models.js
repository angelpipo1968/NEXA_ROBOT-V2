const key = 'AIzaSyDtxLWiUgN-drPaHhEdwY6kIdyaO9Eh9aQ';
console.log('Listing models...');
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(r => r.json())
    .then(d => {
        if (d.error) console.error(d.error);
        else {
            const models = d.models?.map(m => m.name) || [];
            console.log('Available models:', models.join(', '));
        }
    })
    .catch(e => console.error(e));
