# 🔮 Nexa OS - Architecture Roadmap & The "Nexa Loop"

Este documento establece la visión a largo plazo y la arquitectura de próxima generación para escalar **Nexa** de un potente agente conversacional a un **Sistema Operativo Vivo, Autónomo y Seguro**.

## 🔄 El "Nexa Loop" (Flujo de Trabajo Operativo)

El sistema operativo obrará bajo un ciclo perpetuo y consciente compuesto por las siguientes etapas:

1. **Percepción (MCP)**: Nexa lee logs de error (Filesystem MCP), eventos en tiempo real y consulta la DB de usuarios u otros orígenes de datos (Supabase MCP).
2. **Cognición (Local AI)**: Un modelo de incrustación/clasificación ligero (`Transformers.js` / `WebLLM`) pre-clasifica la urgencia y el ruteo de la intención de forma privada y local para ahorrar costos y reducir latencia.
3. **Planificación (Sequential Thinking & UI 3D)**: Se activa el pensamiento secuencial. El usuario visualiza el proceso a través de un **Thought Stream 3D** (gráfico de nodos) que muestra cada paso lógico que el modelo está tomando (`react-force-graph`).
4. **Ejecución Segura (Sandbox)**: En lugar de ejecutar arbitrariamente en la máquina host, Nexa prueba el código generado en un entorno efímero provisto por `@webcontainer/api` (WebContainers).
5. **Aprobación Crítica / Despliegue (Trust Levels)**: Basado en un sistema de **Trust Levels**, si el script altera archivos clave (`write`) o desencadena migraciones de DB (God Mode), Nexa pausará el loop enviando un *Execution Plan* visual. El usuario aprueba la intervención y el código definitivo viaja de regreso al Filesystem real o a un commit de Git.
6. **Memoria y Consolidación (Vector DB)**: Cada caso resuelto o ciclo finalizado se vectoriza y almacena vía RAG en la base de datos `pgvector` de Supabase. A futuro, ante el mismo error, Nexa recordará la solución exitosa sin necesidad de buscar externamente en Google.

---

## 🏗️ Mejoras Arquitectónicas Tier-1

### 1. El "Kernel" de Orquestación (Microservicio)
Hacer la transición hacia un backend asíncrono puro (ej. usando **Hono** en `apps/kernel`), encargado de encolar y procesar tareas delegadas. Esto previene que el apagado de la pestaña del navegador mate un proceso de razonamiento o un despliegue largo. El agente sobrevive independientemente del cliente.

### 2. Sincronización State-Sync (CRDTs)
Desacoplar y escalar el estado local (Zustand). Integrar tecnologías basadas en **CRDTs (Conflict-free Replicated Data Types)** como `yjs` y `y-websocket`. Esto asegura que los historiales de terminal, el canvas espacial y los logs de pensamiento se sincronicen en tiempo real de forma híbrida (Móvil vs. PC escritorio) y colaboren de manera fluida y tolerante a fallos.

### 3. Sistema Inmunitario (Self-Healing)
Módulo local de observabilidad integrado. Ante devoluciones HTTP 500, Crashes y trazas de pila (Stack Traces), un sub-agente evalúa los logs en segundo plano (antes de interactuar con el usuario), y lanza iteraciones RAG para auto-parchear la falla, avisando solo si la mitigación es exitosamente desplegada.

### 4. Marketplace de Herramientas Dinámico
Una capa de descubrimiento sobre MCP (Model Context Protocol). A medida que Nexa cambie su marco de trabajo (Ej: Pasar de editar un archivo `.js` a un entorno de `.py`), cargará un servidor MCP subyacente contextual adecuado (Ej: auto-inyección de herramientas para interactuar con `pip/poetry` y probar scripts en contenedores temporales).

---

## 📦 Stack Requerido Propuesto (Dependencies Injection)

Para consolidar esta infraestructura, las bibliotecas identificadas como dependencias estructurales en las próximas fases son:

**Dependencias Cliente/Shared:**
*   `@supabase/supabase-js` (Conexión RPC a Memoria Vectorial)
*   `yjs` y `y-websocket` (Sincronización colaborativa de Estado local/Nube)
*   `react-force-graph` (Motor de Renderización del flujo cognitivo)
*   `@xenova/transformers` (Incrustaciones LLM directamente en Web Worker)
*   `@webcontainer/api` (Virtualización Efímera de Entornos en Navegador)
*   `langchain` / `@langchain/community` (Orquestación RAG y toolboxes)

**Ajustes de Ensamblaje (Vite Dev):**
*   `vite-plugin-top-level-await`
*   `vite-plugin-wasm` (Requisito estricto de soporte asíncrono para compilación Hono/WebLLM)

---
*Roadmap Arquitectónico Master - Iteración "Sistema Operativo Vivo"*
