function getSearchQuery() {
    const url = new URL(window.location.href);
    return url.searchParams.get('q');
}

function fetchNexaResponse(query) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'FETCH_NEXA', query: query }, (response) => {
            if (response && response.success) {
                resolve(response.data);
            } else {
                resolve("⚠️ **Error de Conexión:** Nexa no está respondiendo. Verifica que tu servidor local (puerto 3001) esté activo.");
            }
        });
    });
}

function injectNexaUI(query) {
    if (document.getElementById('nexa-companion-container')) return;

    const container = document.createElement('div');
    container.id = 'nexa-companion-container';

    container.innerHTML = `
        <div id="nexa-header">
            <span>✨ Nexa AI Companion</span>
            <button id="nexa-close">&times;</button>
        </div>
        <div id="nexa-content">
            <div class="nexa-thought-process">
                <span class="nexa-loading"></span> Procesando la misma búsqueda...
            </div>
        </div>
    `;

    document.body.appendChild(container);

    document.getElementById('nexa-close').addEventListener('click', () => {
        container.classList.add('closing');
        container.style.animation = 'nexaSlideOut 0.3s forwards';
        setTimeout(() => container.remove(), 300);
    });

    const prompt = `El usuario acaba de buscar en Google esto: "${query}". 
Por favor, actúa como tu interfaz de extensión de navegador. Dale una respuesta hiper-directa, precisa y útil que complemente los resultados (con Markdown básico si es útil). Sé muy concisa.`;

    fetchNexaResponse(prompt).then(response => {
        const contentDiv = document.getElementById('nexa-content');
        if (contentDiv) {
            // Un parser muy ligero de Markdown
            let formatted = response
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre>$1</pre>')
                .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br/>');
                
            formatted = `<div class="nexa-markdown"><p>${formatted}</p></div>`;
            contentDiv.innerHTML = formatted;
        }
    });

    // Añadir keyframe dinámico para el slide out
    if (!document.getElementById('nexa-animations')) {
        const style = document.createElement('style');
        style.id = 'nexa-animations';
        style.innerHTML = `
            @keyframes nexaSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(450px); opacity: 0; }
            }
            .nexa-markdown code {
                background: rgba(255,255,255,0.1);
                padding: 2px 4px;
                border-radius: 4px;
                color: #bae6fd;
            }
        `;
        document.head.appendChild(style);
    }
}

// Ejecución Principal
setTimeout(() => {
    const query = getSearchQuery();
    // Solo inyectar si realmente hay una búsqueda y estamos en resultados (no en home)
    if (query && document.body.innerText.length > 500) {
        injectNexaUI(query);
    }
}, 800); // Pequeño retraso para que cargue la interfaz de Google primero
