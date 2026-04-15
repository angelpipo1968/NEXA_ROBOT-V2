# Nexa VS Code

Extension local de VS Code para usar `Nexa` como asistente dentro del editor.

## Qué hace

- Abre un panel lateral llamado `Nexa`
- Envía prompts al backend local `http://localhost:3001/api/chat`
- Puede incluir la selección actual o el archivo activo

## Cómo probarla

1. Abre `c:\nexa` en VS Code.
2. Abre la carpeta `apps/vscode` como proyecto de extensión o agrégala al workspace.
3. Presiona `F5` para lanzar un `Extension Development Host`.
4. En la nueva ventana, abre la vista `Nexa`.
5. Asegúrate de tener el backend de Nexa corriendo en `http://localhost:3001`.

## Configuración

- `nexa.backendUrl`
- `nexa.userId`
