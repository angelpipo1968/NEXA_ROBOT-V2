
async function testPollinations() {
    const prompt = 'A cyberpunk city with neon lights';
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

    console.log(`Testing URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (!response.ok) {
            console.log('Response body:', await response.text());
        } else {
            console.log('Success! Image found.');
            // Check if it's actually an image
            const buffer = await response.arrayBuffer();
            console.log(`Image size: ${buffer.byteLength} bytes`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testPollinations();
