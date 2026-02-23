// apps/kernel/orchestrator.ts - Cerebro distribuido de Nexa
import { Hono } from 'hono';
import { JobQueue } from './queue';
import { TrustLevel, validatePermission } from './security';
import { VectorMemory } from '../../src/packages/memory/vector';

export const kernel = new Hono();
const queue = new JobQueue();

// Inicializamos VectorMemory de forma perezosa
let vectorDB: VectorMemory | null = null;
const getVectorDB = () => {
    if (!vectorDB && process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
        vectorDB = new VectorMemory(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    }
    return vectorDB;
}

// Endpoint principal de procesamiento
kernel.post('/execute', async (c) => {
    const { intent, context, trustLevel = TrustLevel.READ } = await c.req.json();

    // 1. Validar permisos God Mode
    const permissionStatus = validatePermission(trustLevel, context);
    if (!permissionStatus) {
        return c.json({ error: 'PERMISSION_DENIED' }, 403);
    }

    // 2. Búsqueda semántica en memoria (¿Ya resolvimos esto?)
    const db = getVectorDB();
    let similarCases = [];
    if (db) {
        similarCases = await db.search(intent, { limit: 3, threshold: 0.7 });
    }

    // 3. Encolar tarea asíncrona (no bloquea UI)
    const jobId = await queue.add({
        intent,
        context,
        memory: similarCases,
        onProgress: (step: any) => {
            // Broadcast a websockets conectados a este jobId
            console.log(`[Job ${jobId} Progress]:`, step);
        }
    });

    return c.json({
        jobId,
        status: permissionStatus === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'QUEUED',
        thoughtStream: `/ws/thought/${jobId}`
    });
});

// WebSocket simulado/rutas en Hono para visualización del pensamiento en tiempo real
kernel.get('/ws/thought/:jobId', (c) => {
    const ws = c.req.header('Upgrade') === 'websocket';
    // Lógica de broadcast de nodos de pensamiento...
    // Requiere integración Hono websockets adapter, retornamos OK temporalmente.
    return c.body(null, 101);
});
