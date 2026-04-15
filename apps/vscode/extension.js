const vscode = require('vscode');
const cp = require('node:child_process');

class NexaViewProvider {
    constructor(context) {
        this.context = context;
        this.view = undefined;
        this.pendingPrompt = undefined;
        this.lastAssistantMessage = '';
        this.history = [];
        this.mode = getDefaultMode();
    }

    resolveWebviewView(webviewView) {
        console.log('NexaViewProvider.resolveWebviewView');
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            retainContextWhenHidden: true,
        };
        webviewView.webview.html = this.getHtml(webviewView.webview);

        webviewView.onDidDispose(() => {
            console.log('NexaViewProvider view disposed');
            this.view = undefined;
        });

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'ready') {
                webviewView.webview.postMessage({
                    type: 'mode',
                    value: this.mode,
                });
                if (this.pendingPrompt) {
                    webviewView.webview.postMessage({
                        type: 'prefill',
                        value: this.pendingPrompt,
                    });
                    this.pendingPrompt = undefined;
                }
                return;
            }

            if (message.type === 'send') {
                await this.handlePrompt(message.value, {
                    includeFile: message.includeFile,
                    includeWorkspace: message.includeWorkspace,
                    mode: message.mode || this.mode,
                });
                return;
            }

            if (message.type === 'insertLastAnswer') {
                await insertTextIntoEditor(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'replaceSelectionWithLastAnswer') {
                await replaceSelectionWithText(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'replaceActiveFileWithLastAnswer') {
                await replaceActiveFileWithText(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'previewLastAnswer') {
                await previewTextDocument(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'diffLastAnswerAgainstSelection') {
                await diffLastAnswerAgainstSelection(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'applyStructuredFiles') {
                await applyStructuredFiles(this.lastAssistantMessage);
                return;
            }

            if (message.type === 'action') {
                await this.handleAction(message.name);
                return;
            }

            if (message.type === 'mode') {
                this.mode = normalizeMode(message.value);
                return;
            }
        });
    }

    show() {
        vscode.commands.executeCommand('workbench.view.extension.nexa');
    }

    async revealWithPrompt(prompt) {
        this.show();
        this.pendingPrompt = prompt;

        if (this.view) {
            this.view.show?.(true);
            this.view.webview.postMessage({ type: 'prefill', value: prompt });
            this.pendingPrompt = undefined;
        } else {
            console.log('NexaViewProvider.revealWithPrompt: view not ready, prompt queued');
        }
    }

    async handlePrompt(prompt, options = {}) {
        const cleanPrompt = String(prompt || '').trim();
        if (!cleanPrompt) return;
        if (!this.view) {
            console.warn('NexaViewProvider.handlePrompt called without an active view');
            vscode.window.showWarningMessage('Nexa no está visible. Abre la vista Nexa antes de enviar prompts.');
            return;
        }

        this.view.webview.postMessage({
            type: 'message',
            role: 'user',
            text: cleanPrompt,
        });
        this.history.push({ role: 'user', text: cleanPrompt });
        this.view.webview.postMessage({ type: 'loading', value: true });

        try {
            const payload = await buildPayload(cleanPrompt, options);
            const response = await fetch(`${getBackendUrl()}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: buildModePrompt(payload.message, options.mode || this.mode),
                    userId: getUserId(),
                    context: [
                        ...this.history.slice(-8).map((item) => ({
                            role: item.role === 'assistant' ? 'model' : 'user',
                            parts: item.text,
                        })),
                        ...payload.context,
                    ],
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            const text = data.response || data.reply || 'Nexa no devolvio contenido.';
            this.lastAssistantMessage = text;
            this.history.push({ role: 'assistant', text });
            this.view.webview.postMessage({
                type: 'message',
                role: 'assistant',
                text,
            });
        } catch (error) {
            console.error('NexaViewProvider.handlePrompt failed', error);

            let errorMessage = 'Error conectando con Nexa';
            let showNotification = true;

            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                errorMessage = '⏱️ Timeout conectando con Nexa. Verifica que el backend esté ejecutándose.';
                backendStatus = 'disconnected';
                backendStatusBar.text = '$(warning) Backend Offline';
                backendStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            } else if (error.message.includes('fetch')) {
                errorMessage = '🌐 Error de conexión. Verifica la URL del backend en configuración.';
                backendStatus = 'disconnected';
                backendStatusBar.text = '$(warning) Backend Offline';
                backendStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            } else if (error.message.includes('HTTP')) {
                errorMessage = `🔴 Error del servidor: ${error.message}`;
                backendStatus = 'error';
                backendStatusBar.text = '$(error) Backend Error';
                backendStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            } else {
                errorMessage = `❌ Error: ${error.message}`;
            }

            this.view.webview.postMessage({
                type: 'message',
                role: 'assistant',
                text: errorMessage,
            });

            if (showNotification) {
                vscode.window.showErrorMessage(errorMessage, 'Verificar estado').then(selection => {
                    if (selection === 'Verificar estado') {
                        vscode.commands.executeCommand('nexa.checkBackendStatus');
                    }
                });
            }
        } finally {
            this.view.webview.postMessage({ type: 'loading', value: false });
        }
    }

    async handleAction(name) {
        if (name === 'explainSelection') {
            const prompt = await buildSelectionPrompt(
                'Explica esta seleccion de codigo, detecta riesgos y propone mejoras concretas.'
            );
            await this.revealWithPrompt(prompt);
            await this.handlePrompt(prompt, { includeDiagnostics: true, mode: 'reviewer' });
            return;
        }

        if (name === 'reviewFile') {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No hay un archivo activo.');
                return;
            }

            const prompt = `Haz code review del archivo activo ${editor.document.fileName}. Prioriza bugs, regresiones, riesgos y pruebas faltantes.`;
            await this.revealWithPrompt(prompt);
            await this.handlePrompt(prompt, { includeFile: true, includeDiagnostics: true, mode: 'reviewer' });
            return;
        }

        if (name === 'fixSelection') {
            const prompt = await buildSelectionPrompt(
                'Corrige esta seleccion de codigo. Devuelve solo el codigo corregido, sin explicacion.'
            );
            await this.revealWithPrompt(prompt);
            await this.handlePrompt(prompt, { includeDiagnostics: true, mode: 'builder' });
            return;
        }

        if (name === 'workspaceReview') {
            const prompt = await buildWorkspacePrompt();
            await this.revealWithPrompt(prompt);
            await this.handlePrompt(prompt, { includeWorkspace: true, includeDiagnostics: true, mode: 'architect' });
            return;
        }

        if (name === 'commitMessage') {
            const prompt = await buildCommitPrompt();
            await this.revealWithPrompt(prompt);
            await this.handlePrompt(prompt, { includeWorkspace: true, mode: 'reviewer' });
            return;
        }
    }

    getHtml(webview) {
        const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'spark.svg'));

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        :root {
            color-scheme: dark;
            --bg: #0c1017;
            --panel: #121826;
            --panel-2: #182132;
            --text: #edf2ff;
            --muted: #8ea0c0;
            --accent: #5eead4;
            --accent-2: #60a5fa;
            --border: rgba(255,255,255,0.08);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: radial-gradient(circle at top, #182132, #0c1017 55%);
            color: var(--text);
            font-family: Consolas, "Courier New", monospace;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            padding: 14px 14px 10px;
            border-bottom: 1px solid var(--border);
            background: rgba(12,16,23,0.88);
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: var(--muted);
        }
        .brand img { width: 18px; height: 18px; }
        .title {
            margin-top: 8px;
            font-size: 18px;
            font-weight: 700;
            color: var(--text);
        }
        .actions {
            display: flex;
            gap: 8px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        button {
            border: 1px solid var(--border);
            background: var(--panel);
            color: var(--text);
            border-radius: 10px;
            padding: 8px 10px;
            cursor: pointer;
            font: inherit;
        }
        button:hover { border-color: var(--accent-2); }
        .messages {
            flex: 1;
            overflow: auto;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            border: 1px solid var(--border);
            background: rgba(18,24,38,0.92);
            border-radius: 14px;
            padding: 12px;
            white-space: pre-wrap;
            line-height: 1.45;
        }
        .message.user {
            background: linear-gradient(135deg, rgba(96,165,250,0.16), rgba(94,234,212,0.08));
        }
        .message.assistant {
            background: rgba(24,33,50,0.92);
        }
        .role {
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--accent);
        }
        .composer {
            padding: 12px;
            border-top: 1px solid var(--border);
            background: rgba(12,16,23,0.92);
        }
        textarea {
            width: 100%;
            min-height: 110px;
            resize: vertical;
            background: var(--panel);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px;
            font: inherit;
        }
        .composer-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
        }
        .mode-row {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 10px;
        }
        select {
            background: var(--panel);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 8px 10px;
            font: inherit;
        }
        .status {
            font-size: 11px;
            color: var(--muted);
        }
        .status.connected {
            color: #10b981;
        }
        .status.disconnected {
            color: #f59e0b;
        }
        .status.error {
            color: #ef4444;
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
        }
        .status-indicator.connected {
            background-color: #10b981;
        }
        .status-indicator.disconnected {
            background-color: #f59e0b;
        }
        .status-indicator.error {
            background-color: #ef4444;
        }
        .send {
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            color: #081018;
            border: none;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <img src="${iconUri}" alt="Nexa" />
            <span>Nexa Local Core</span>
        </div>
        <div class="title">Asistente en VS Code</div>
        <div class="actions">
            <button id="selection">Explicar seleccion</button>
            <button id="review">Revisar archivo</button>
            <button id="workspace">Revisar workspace</button>
            <button id="commit">Commit message</button>
            <button id="fix">Corregir seleccion</button>
            <button id="file">Incluir archivo</button>
        </div>
    </div>
    <div id="messages" class="messages"></div>
    <div class="composer">
        <div class="mode-row">
            <select id="mode">
                <option value="architect">Architect</option>
                <option value="reviewer">Reviewer</option>
                <option value="builder">Builder</option>
            </select>
            <button id="workspaceContext">Contexto workspace</button>
        </div>
        <textarea id="prompt" placeholder="Pidele a Nexa que explique codigo, proponga cambios o revise el archivo actual."></textarea>
        <div class="composer-row">
            <div id="status" class="status">
                <span id="statusIndicator" class="status-indicator disconnected"></span>
                <span id="statusText">Verificando conexión...</span>
            </div>
            <div style="display:flex; gap:8px;">
                <button id="insert">Insertar</button>
                <button id="preview">Preview</button>
                <button id="diff">Diff</button>
                <button id="files">Aplicar archivos</button>
                <button id="replaceSelection">Reemplazar seleccion</button>
                <button id="replaceFile">Reemplazar archivo</button>
                <button id="send" class="send">Enviar</button>
            </div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messages = document.getElementById('messages');
        const prompt = document.getElementById('prompt');
        const status = document.getElementById('status');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const send = document.getElementById('send');
        const selection = document.getElementById('selection');
        const review = document.getElementById('review');
        const workspace = document.getElementById('workspace');
        const commit = document.getElementById('commit');
        const fix = document.getElementById('fix');
        const file = document.getElementById('file');
        const insert = document.getElementById('insert');
        const preview = document.getElementById('preview');
        const diff = document.getElementById('diff');
        const files = document.getElementById('files');
        const replaceSelection = document.getElementById('replaceSelection');
        const replaceFile = document.getElementById('replaceFile');
        const mode = document.getElementById('mode');
        const workspaceContext = document.getElementById('workspaceContext');
        let includeFile = false;
        let includeWorkspace = false;

        function appendMessage(role, text) {
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.innerHTML = '<span class="role">' + role + '</span>' + escapeHtml(text);
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        send.addEventListener('click', () => {
            const value = prompt.value.trim();
            if (!value) return;
            vscode.postMessage({
                type: 'send',
                value,
                includeFile,
                includeWorkspace,
                mode: mode.value
            });
            prompt.value = '';
            includeFile = false;
            includeWorkspace = false;
            file.textContent = 'Incluir archivo';
            workspaceContext.textContent = 'Contexto workspace';
        });

        prompt.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                send.click();
            }
        });

        selection.addEventListener('click', () => {
            vscode.postMessage({ type: 'action', name: 'explainSelection' });
        });

        review.addEventListener('click', () => {
            vscode.postMessage({ type: 'action', name: 'reviewFile' });
        });

        workspace.addEventListener('click', () => {
            vscode.postMessage({ type: 'action', name: 'workspaceReview' });
        });

        commit.addEventListener('click', () => {
            vscode.postMessage({ type: 'action', name: 'commitMessage' });
        });

        fix.addEventListener('click', () => {
            vscode.postMessage({ type: 'action', name: 'fixSelection' });
        });

        file.addEventListener('click', () => {
            includeFile = !includeFile;
            file.textContent = includeFile ? 'Archivo incluido' : 'Incluir archivo';
        });

        workspaceContext.addEventListener('click', () => {
            includeWorkspace = !includeWorkspace;
            workspaceContext.textContent = includeWorkspace ? 'Workspace incluido' : 'Contexto workspace';
        });

        mode.addEventListener('change', () => {
            vscode.postMessage({ type: 'mode', value: mode.value });
        });

        insert.addEventListener('click', () => {
            vscode.postMessage({ type: 'insertLastAnswer' });
        });

        preview.addEventListener('click', () => {
            vscode.postMessage({ type: 'previewLastAnswer' });
        });

        diff.addEventListener('click', () => {
            vscode.postMessage({ type: 'diffLastAnswerAgainstSelection' });
        });

        files.addEventListener('click', () => {
            vscode.postMessage({ type: 'applyStructuredFiles' });
        });

        replaceSelection.addEventListener('click', () => {
            vscode.postMessage({ type: 'replaceSelectionWithLastAnswer' });
        });

        replaceFile.addEventListener('click', () => {
            vscode.postMessage({ type: 'replaceActiveFileWithLastAnswer' });
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'message') {
                appendMessage(message.role, message.text);
            }
            if (message.type === 'loading') {
                statusText.textContent = message.value ? 'Consultando Nexa...' : 'Listo';
            }
            if (message.type === 'backendStatus') {
                updateBackendStatus(message.status);
            }
            if (message.type === 'prefill') {
                prompt.value = message.value || '';
                prompt.focus();
            }
            if (message.type === 'mode') {
                mode.value = message.value;
            }
        });

        function updateBackendStatus(status) {
            statusIndicator.className = 'status-indicator ' + status;
            statusText.className = 'status ' + status;

            switch (status) {
                case 'connected':
                    statusText.textContent = 'Backend conectado';
                    break;
                case 'disconnected':
                    statusText.textContent = 'Backend desconectado';
                    break;
                case 'error':
                    statusText.textContent = 'Error en backend';
                    break;
                default:
                    statusText.textContent = 'Verificando...';
            }
        }

        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
    }
}

async function buildPayload(prompt, options = {}) {
    const editor = vscode.window.activeTextEditor;
    const context = [];
    let message = prompt;

    if (editor) {
        const selection = editor.selection && !editor.selection.isEmpty
            ? editor.document.getText(editor.selection)
            : '';

        if (selection) {
            context.push({
                role: 'user',
                parts: `Seleccion activa del archivo ${editor.document.fileName}:\n${selection}`,
            });
        }

        if (options.includeFile) {
            const fileText = editor.document.getText().slice(0, 16000);
            context.push({
                role: 'user',
                parts: `Archivo activo ${editor.document.fileName}:\n${fileText}`,
            });
        }

        if (options.includeDiagnostics) {
            const diagnostics = vscode.languages.getDiagnostics(editor.document.uri)
                .slice(0, 30)
                .map((item) => {
                    const line = item.range.start.line + 1;
                    return `${diagnosticSeverity(item.severity)} L${line}: ${item.message}`;
                });

            if (diagnostics.length > 0) {
                context.push({
                    role: 'user',
                    parts: `Diagnosticos actuales del editor:\n${diagnostics.join('\n')}`,
                });
            }
        }
    }

    if (options.includeWorkspace) {
        const workspaceContext = await getWorkspaceSummary();
        if (workspaceContext) {
            context.push({
                role: 'user',
                parts: workspaceContext,
            });
        }
    }

    return { message, context };
}

async function buildSelectionPrompt(basePrompt) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return basePrompt;
    }

    const selection = editor.selection && !editor.selection.isEmpty
        ? editor.document.getText(editor.selection)
        : editor.document.getText().slice(0, 12000);

    return `${basePrompt}\n\nArchivo: ${editor.document.fileName}\n\n${selection}`;
}

async function insertTextIntoEditor(text) {
    const normalized = extractUsableText(text);
    if (!normalized) {
        vscode.window.showWarningMessage('Todavia no hay respuesta de Nexa para insertar.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No hay un editor activo.');
        return;
    }

    await editor.edit((editBuilder) => {
        if (editor.selection && !editor.selection.isEmpty) {
            editBuilder.replace(editor.selection, normalized);
        } else {
            editBuilder.insert(editor.selection.active, normalized);
        }
    });
}

async function replaceSelectionWithText(text) {
    const normalized = extractUsableText(text);
    if (!normalized) {
        vscode.window.showWarningMessage('No hay respuesta util de Nexa para aplicar.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No hay un editor activo.');
        return;
    }

    if (!editor.selection || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('Selecciona el bloque que quieres reemplazar.');
        return;
    }

    await showDiffPreview(
        editor.document,
        editor.document.getText(editor.selection),
        normalized,
        'NEXAOS Selection Preview'
    );

    const confirm = await vscode.window.showInformationMessage(
        'Vista previa lista. Quieres reemplazar la seleccion con la ultima respuesta de NEXAOS?',
        { modal: true },
        'Aplicar cambio'
    );

    if (confirm !== 'Aplicar cambio') {
        return;
    }

    await editor.edit((editBuilder) => {
        editBuilder.replace(editor.selection, normalized);
    });
}

async function replaceActiveFileWithText(text) {
    const normalized = extractUsableText(text);
    if (!normalized) {
        vscode.window.showWarningMessage('No hay respuesta util de Nexa para aplicar.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No hay un editor activo.');
        return;
    }

    const document = editor.document;
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );

    const confirm = await vscode.window.showWarningMessage(
        'Esto reemplazara todo el archivo activo con la ultima respuesta de NEXAOS.',
        { modal: true },
        'Reemplazar archivo'
    );

    if (confirm !== 'Reemplazar archivo') {
        return;
    }

    await showDiffPreview(
        document,
        document.getText(),
        normalized,
        'NEXAOS File Preview'
    );

    const finalConfirm = await vscode.window.showWarningMessage(
        'La vista previa del archivo esta abierta. Confirmas reemplazar todo el archivo?',
        { modal: true },
        'Aplicar archivo'
    );

    if (finalConfirm !== 'Aplicar archivo') {
        return;
    }

    await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, normalized);
    });
}

function extractUsableText(text) {
    const source = String(text || '').trim();
    if (!source) return '';

    const fenced = source.match(/```(?:[\w+-]+)?\n([\s\S]*?)```/);
    if (fenced && fenced[1]) {
        return fenced[1].trim();
    }

    return source;
}

async function previewTextDocument(text) {
    const normalized = extractUsableText(text);
    if (!normalized) {
        vscode.window.showWarningMessage('No hay respuesta util para previsualizar.');
        return;
    }

    const document = await vscode.workspace.openTextDocument({
        language: detectLanguageFromActiveEditor(),
        content: normalized,
    });
    await vscode.window.showTextDocument(document, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

async function diffLastAnswerAgainstSelection(text) {
    const normalized = extractUsableText(text);
    if (!normalized) {
        vscode.window.showWarningMessage('No hay respuesta util para comparar.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No hay un editor activo.');
        return;
    }

    const original = editor.selection && !editor.selection.isEmpty
        ? editor.document.getText(editor.selection)
        : editor.document.getText();

    await showDiffPreview(editor.document, original, normalized, 'NEXAOS Diff');
}

async function showDiffPreview(document, original, proposed, title) {
    const language = document.languageId || 'plaintext';
    const left = await vscode.workspace.openTextDocument({
        language,
        content: String(original || ''),
    });
    const right = await vscode.workspace.openTextDocument({
        language,
        content: String(proposed || ''),
    });

    await vscode.commands.executeCommand(
        'vscode.diff',
        left.uri,
        right.uri,
        title,
        { preview: true, viewColumn: vscode.ViewColumn.Beside }
    );
}

function diagnosticSeverity(severity) {
    switch (severity) {
        case vscode.DiagnosticSeverity.Error:
            return 'ERROR';
        case vscode.DiagnosticSeverity.Warning:
            return 'WARN';
        case vscode.DiagnosticSeverity.Information:
            return 'INFO';
        case vscode.DiagnosticSeverity.Hint:
            return 'HINT';
        default:
            return 'LOG';
    }
}

async function getWorkspaceSummary() {
    const files = await vscode.workspace.findFiles(
        '**/*.{ts,tsx,js,jsx,json,md}',
        '**/{node_modules,dist,.git,backups,_backup,src_backup_20260202_152431}/**',
        40
    );

    if (files.length === 0) {
        return '';
    }

    const items = files.slice(0, 25).map((file) => vscode.workspace.asRelativePath(file));
    const diagnostics = vscode.languages.getDiagnostics()
        .slice(0, 20)
        .flatMap(([uri, entries]) => entries.slice(0, 3).map((entry) => {
            const line = entry.range.start.line + 1;
            return `${vscode.workspace.asRelativePath(uri)}:${line} ${diagnosticSeverity(entry.severity)} ${entry.message}`;
        }));
    const git = getGitSummary();
    return [
        'Resumen parcial del workspace abierto:',
        ...items,
        '',
        git,
        '',
        diagnostics.length > 0 ? `Diagnosticos:\n${diagnostics.join('\n')}` : 'Diagnosticos: none',
    ].join('\n');
}

async function buildWorkspacePrompt() {
    const summary = await getWorkspaceSummary();
    return `Haz una revision tecnica del workspace abierto. Prioriza bugs, arquitectura, deuda tecnica, seguridad y siguientes pasos.\n\n${summary}`;
}

function getBackendUrl() {
    return vscode.workspace.getConfiguration().get('nexa.backendUrl') || 'http://localhost:3001';
}

function getUserId() {
    return vscode.workspace.getConfiguration().get('nexa.userId') || 'vscode-user';
}

function getDefaultMode() {
    return normalizeMode(vscode.workspace.getConfiguration().get('nexa.defaultMode') || 'reviewer');
}

function normalizeMode(mode) {
    if (mode === 'architect' || mode === 'builder' || mode === 'reviewer') {
        return mode;
    }
    return 'reviewer';
}

function buildModePrompt(prompt, mode) {
    const normalized = normalizeMode(mode);
    const prefixes = {
        architect: 'Modo ARCHITECT: piensa en arquitectura, tradeoffs, sistema completo y plan de cambios.',
        reviewer: 'Modo REVIEWER: prioriza bugs, regresiones, riesgos, pruebas faltantes y claridad tecnica.',
        builder: 'Modo BUILDER: entrega cambios aplicables, codigo final y pasos concretos con minima teoria.',
    };
    return `${prefixes[normalized]}\n\n${prompt}`;
}

function detectLanguageFromActiveEditor() {
    return vscode.window.activeTextEditor?.document.languageId || 'plaintext';
}

function getGitSummary() {
    try {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root) return 'Git: no workspace root';
        const output = cp.execSync('git status --short', {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        return output ? `Git changes:\n${output}` : 'Git changes: clean';
    } catch {
        return 'Git changes: unavailable';
    }
}

async function buildCommitPrompt() {
    const git = getGitSummary();
    return `Genera 5 mensajes de commit claros y profesionales basados en estos cambios. Usa formato conventional commits.\n\n${git}`;
}

function parseStructuredFiles(text) {
    const source = String(text || '');
    const matches = [...source.matchAll(/FILE:\s*([^\n\r]+)\r?\n```(?:[\w.+-]+)?\r?\n([\s\S]*?)```/g)];
    return matches.map((match) => ({
        path: match[1].trim(),
        content: match[2].trim(),
    }));
}

async function applyStructuredFiles(text) {
    const files = parseStructuredFiles(text);
    if (files.length === 0) {
        vscode.window.showWarningMessage(
            'No encontre bloques estructurados. Usa este formato: FILE: ruta/archivo.ext seguido de un bloque ```codigo```.'
        );
        return;
    }

    const root = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!root) {
        vscode.window.showWarningMessage('No hay un workspace abierto.');
        return;
    }

    const picked = await vscode.window.showQuickPick(
        files.map((file, index) => ({
            label: file.path,
            description: `${file.content.length} chars`,
            index,
            picked: true,
        })),
        {
            canPickMany: true,
            title: 'Selecciona los archivos estructurados que quieres aplicar',
        }
    );

    if (!picked || picked.length === 0) {
        return;
    }

    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const item of picked) {
        const file = files[item.index];
        const target = vscode.Uri.joinPath(root, ...file.path.split('/'));
        workspaceEdit.createFile(target, { ignoreIfExists: false, overwrite: true });
        workspaceEdit.insert(target, new vscode.Position(0, 0), file.content);
    }

    const confirm = await vscode.window.showWarningMessage(
        `Se van a crear o reemplazar ${picked.length} archivo(s) desde la respuesta de NEXAOS.`,
        { modal: true },
        'Aplicar archivos'
    );

    if (confirm !== 'Aplicar archivos') {
        return;
    }

    await vscode.workspace.applyEdit(workspaceEdit);

    for (const item of picked) {
        const file = files[item.index];
        const target = vscode.Uri.joinPath(root, ...file.path.split('/'));
        const doc = await vscode.workspace.openTextDocument(target);
        await vscode.window.showTextDocument(doc, { preview: false });
    }
}

function activate(context) {
    console.log('Nexa VS Code extension activated');
    const provider = new NexaViewProvider(context);
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(hubot) NEXAOS';
    statusBar.tooltip = 'Abrir NEXAOS';
    statusBar.command = 'nexa.openChat';
    statusBar.show();

    // Backend status indicator
    const backendStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    backendStatusBar.text = '$(sync~spin) Conectando...';
    backendStatusBar.tooltip = 'Estado del backend de Nexa';
    backendStatusBar.command = 'nexa.checkBackendStatus';
    backendStatusBar.show();

    console.log('Registering Nexa view provider for nexa.chatView');
    const registration = vscode.window.registerWebviewViewProvider('nexa.chatView', provider, {
        webviewOptions: { retainContextWhenHidden: true },
    });

    // Check backend status periodically
    let backendStatus = 'unknown';
    const checkBackendStatus = async () => {
        try {
            const response = await fetch(`${getBackendUrl()}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
                backendStatus = 'connected';
                backendStatusBar.text = '$(check) Backend OK';
                backendStatusBar.backgroundColor = undefined;
                backendStatusBar.tooltip = 'Backend de Nexa conectado y funcionando';
            } else {
                backendStatus = 'error';
                backendStatusBar.text = '$(error) Backend Error';
                backendStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                backendStatusBar.tooltip = `Error del backend: HTTP ${response.status}`;
            }
        } catch (error) {
            backendStatus = 'disconnected';
            backendStatusBar.text = '$(warning) Backend Offline';
            backendStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            backendStatusBar.tooltip = 'Backend de Nexa no disponible. Verifica que esté ejecutándose.';
        }

        // Notify webview of status change
        if (provider.view) {
            provider.view.webview.postMessage({
                type: 'backendStatus',
                status: backendStatus
            });
        }
    };

    // Initial check
    checkBackendStatus();

    // Check every 30 seconds
    const statusCheckInterval = setInterval(checkBackendStatus, 30000);

    context.subscriptions.push(
        statusBar,
        backendStatusBar,
        registration,
        vscode.commands.registerCommand('nexa.openChat', async () => {
            provider.show();
            await provider.revealWithPrompt('Ayudame con este proyecto abierto en VS Code.');
            provider.view?.webview.postMessage({ type: 'mode', value: provider.mode });
        }),
        vscode.commands.registerCommand('nexa.explainSelection', async () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor && !editor.selection.isEmpty
                ? editor.document.getText(editor.selection)
                : '';

            const prompt = selection
                ? `Explica este codigo y propon mejoras:\n\n${selection}`
                : 'No hay seleccion. Explica el archivo actual y dime que mejorar.';

            await provider.revealWithPrompt(prompt);
        }),
        vscode.commands.registerCommand('nexa.sendActiveFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No hay un archivo activo.');
                return;
            }

            const prompt = `Revisa el archivo activo ${editor.document.fileName} y dime bugs, riesgos y mejoras concretas.`;
            await provider.revealWithPrompt(prompt);
            await provider.handlePrompt(prompt, { includeFile: true });
        }),
        vscode.commands.registerCommand('nexa.reviewActiveFile', async () => {
            await provider.handleAction('reviewFile');
        }),
        vscode.commands.registerCommand('nexa.fixSelection', async () => {
            await provider.handleAction('fixSelection');
        }),
        vscode.commands.registerCommand('nexa.insertLastAnswer', async () => {
            await insertTextIntoEditor(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.replaceSelectionWithLastAnswer', async () => {
            await replaceSelectionWithText(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.replaceActiveFileWithLastAnswer', async () => {
            await replaceActiveFileWithText(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.workspaceReview', async () => {
            await provider.handleAction('workspaceReview');
        }),
        vscode.commands.registerCommand('nexa.previewLastAnswer', async () => {
            await previewTextDocument(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.generateCommitMessage', async () => {
            await provider.handleAction('commitMessage');
        }),
        vscode.commands.registerCommand('nexa.applyStructuredFiles', async () => {
            await applyStructuredFiles(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.diffLastAnswerAgainstSelection', async () => {
            await diffLastAnswerAgainstSelection(provider.lastAssistantMessage);
        }),
        vscode.commands.registerCommand('nexa.checkBackendStatus', async () => {
            await checkBackendStatus();
            const statusMessage = backendStatus === 'connected' ? '✅ Backend conectado'
                               : backendStatus === 'error' ? '❌ Error en backend'
                               : '⚠️ Backend desconectado';
            vscode.window.showInformationMessage(`Estado del backend: ${statusMessage}`);
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
