# 🤖 Nexa OS - Compilación Completa (The Ultimate Guide)

Este documento es una compilación exhaustiva de **Nexa OS**, un sistema operativo conversacional y agente de desarrollo autónomo y avanzado, integrando múltiples tecnologías, capacidades de Inteligencia Artificial multiplataforma y un ecosistema MCP en constante expansión.

---

## 🏗️ 1. Arquitectura y Stack Tecnológico

Nexa OS es un Monorepo estructurado para servir como plataforma Web y Móvil (Android/iOS):
- **Frontend Core**: React 19, DOM virtual avanzado.
- **Backend/API (Local y en la Nube)**: Node.js / Hono.
- **Empaquetador/Build**: Vite 6, Tailwind CSS 3.
- **Mobile Foundation**: Capacitor 8 (Android/iOS integration).
- **Base de Datos & Auth**: Supabase Auth + Supabase DB.
- **Almacenamiento Local de Estado**: Zustand.

### Estructura de Proyecto:
- `apps/web`: Frontend en React enfocado al usuario final.
- `apps/api`: Backend API.
- `packages/core`: Lógica de Sistema Básica.
- `packages/memory`: Gestión de contextos y Memoria a corto y largo plazo.
- `packages/tools`: Utilidades core y funciones auxiliares.
- `infra`: Configuración Docker y Despliegues (Vercel/Local).
- `android`: Compilación nativa para dispositivos Android (Galaxy S25 Ultra profile adaptado).

---

## 🧠 2. Capacidades de Inteligencia Artificial (El Núcleo)

Nexa opera no solo como chatbot, sino como un **Agente Reflexivo y Autónomo**.

1. **Sequential Thinking (Pensamiento Secuencial)**:
   - Nexa detiene su ejecución para "pensar" y planear internamente antes de emitir un comando o respuesta.
   - Analiza el árbol de decisiones, subdividiendo el problema general en iteraciones más simples.
2. **ReAct Loop Constante**:
   - Capaz de encadenar herramientas por sí mismo en bucles de hasta 10 iteraciones, verificando su trabajo retroactivamente y corrigiendo fallos iteración por iteración.
3. **Exploración de Entorno (File System Tools)**:
   - Puede leer directorios completos, analizar los manifiestos (Ej. `package.json`), buscar dependencias (vía `grep_search`), e inyectar código de manera autónoma (`write_to_file`, `replace_file_content`).
4. **Capacidades Multimodales**:
   - Generación y procesamiento de Imágenes (Webcam support, Three.js Rendering, Image Generation).
   - Síntesis de Texto a Voz (TTS) y procesamiento auditivo (`@capacitor-community/text-to-speech`, Tone.js, Magenta Music).
   - Renderizado PWA/3D (Three.js, Radix UI).

---

## 🌐 3. Ecosistema de Servidores MCP (Model Context Protocol)

El verdadero potencial de Nexa OS proviene de sus múltiples canales MCP conectados a sus "sentidos" y flujos de trabajo locales y en la nube:

| Servidor MCP | Propósito Principal |
| :--- | :--- |
| **Filesystem** | Acceso en crudo lectura/escritura en el SO local (`C:/Users/pipog`, `C:/nexa`). |
| **Brave Search** | Búsquedas Web en tiempo real para datos técnicos, errores de compilación web o actualidad. |
| **Github** | Conexión e interacciones con el ecosistema de código abierto (Búsqueda de repositorios, Pull Requests, Análisis de código). |
| **Supabase** | Acceso integral a las bases de datos `nhzxaduqutvsrpjecuah.supabase.co` para persistir memoria de corto/largo plazo y sesiones. |
| **Firebase** | Interfaz del Firebase Realtime Database. |
| **Google Gen AI & OpenAI & Anthropic** | Orquestación multimodal y fallback de modelos fundacionales. |
| **Memory** | Sistema de memoria contextual por turnos gestionado protocolarmente. |
| **Fireflies** | Transcripción de reportes y reuniones, integración de audio directo a entendimiento de LLM. |
| **Sequential Thinking** | Protocolo interno de auto-razonamiento con capacidad de revisión y ramificación. |
| **N8N / Zapier** | Automatización universal. Enlaza flujos de trabajo visuales directamente con herramientas web de terceros (Correo, Docs, Drive, CRMs). |

> *Nota: Servidores como GitLab, Slack, Notion y Vercel están pre-configurados pero pausados de forma predeterminada para el ahorro de tokens / context window.*

---

## 🚀 4. Tecnologías y Librerías Integradas (Package.json)

- **UI / UX**: `@radix-ui/react-*`, `@phosphor-icons/react`, `lucide-react`, `framer-motion`, `three` (Web 3D).
- **Interacción Dispositivos**: `@capacitor/android`, `@capacitor/core`, `@capacitor/keyboard`, `@capacitor/status-bar`.
- **Ecosistema React**: `react-router-dom`, `recharts` (Gráficos), `zustand`.
- **Tratamiento Multimedia**: `@magenta/music`, `tone`, `wavesurfer.js`, `recorder-js`, `react-webcam`.
- **Análisis de Archivos**: `mammoth` (DOCX), `jspdf` (PDF), `html2canvas`, `html-to-text`.

---

## 🛡️ 5. Identity & God Mode Protocol

Nexa asume un comportamiento "God Mode", siendo altamente proactivo, ejecutando y compilando scripts nativos (powershell, bash) requeridos para testear la aplicación o levantar servicios. Posee permisos directos para realizar despliegues (`deploy:vercel`), instalar librerías nativamente, validar código estricto de Typescript y conectarse a un entorno productivo Vercel & Supabase sin mediación excesiva del usuario.

Su estilo conversacional está regido por las reglas globales del usuario:
* **UI**: React y CSS vanilla/Tailwind optimizado.
* **Backend**: Node.js natural. 
* **Estilo de código**: Expresivo, mantenible y enfocado en la usabilidad final.

---

> V1.0 - Compilación definitiva de las mecánicas subyacentes de Nexa OS. Compilado automáticamente.
