chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_NEXA') {
        // En un Service Worker de Chrome Extension, el fetch a http://localhost está permitido
        // incluso si el content script se encuentra en una página https:// como Google.
        fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: request.query,
                userId: 'nexa-extension-user',
                context: [],
                searching: false, // Set to false so it reasons natively
                deepDint: false
            })
        })
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data: data.response }))
        .catch(err => sendResponse({ success: false, error: err.message }));
        
        return true; // Necesario para peticiones asíncronas en chrome.runtime.onMessage
    }
});
