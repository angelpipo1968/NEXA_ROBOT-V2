import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { memoryManager } from '@nexa/memory'
import { safetyFilter } from '@nexa/core'
import { securityMiddleware } from './middleware/security'
import { ToolOrchestrator } from '@nexa/tools'
import { ModelRouter } from '@nexa/models'
import { NexaWritingStudio } from '@nexa/writing'
import { RealTimeMetrics } from './metrics'

const app = new Hono()

// Services
const toolOrchestrator = new ToolOrchestrator();
const modelRouter = new ModelRouter();
const studio = new NexaWritingStudio();

app.use('/*', cors())
app.use('/api/*', securityMiddleware())

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Nexa API',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/api/health', '/api/chat', '/api/tools/execute', '/api/models/switch', '/api/admin/metrics']
  })
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Chat Endpoint
app.post('/api/chat', async (c) => {
  const body = await c.req.json()
  const { message, userId, context, deepDint, searching } = body

  // 1. Safety Check (Pre-LLM)
  const safety = await safetyFilter.validate(message)
  if (!safety.allowed) {
    return c.json({ error: 'Safety violation', reason: safety.reason }, 400)
  }

  // 2. Memory Retrieval
  const userMemory = await memoryManager.retrieve(userId, message)

  // 3. Model Routing
  let text = '';
  let responseMetadata = {};

  if (deepDint) {
    const thought = await studio.deepThinker.think(
      message,
      'deepseek-r1:8b',
      [...(context || []), ...userMemory.recent, ...userMemory.similar]
    );
    text = thought.insights.join('\n\n');
    responseMetadata = { deepDint: true, model: 'deepseek-r1:8b' };
  } else {
    let priority = body.priority || 'balanced';
    if (searching) priority = 'precise';

    const response = await modelRouter.route({
      userId,
      message,
      context: [...(context || []), ...userMemory.recent, ...userMemory.similar],
      priority
    });
    text = response.text;
    responseMetadata = {
      model: response.modelId || 'routed-model',
      latency: response.latency,
      cost: response.cost,
      deepDint: false
    };
  }

  // 4. Memory Update
  await memoryManager.update(userId, { query: message, response: text })

  return c.json({
    response: text,
    metadata: {
      ...responseMetadata,
      searching: !!searching
    }
  })
})

// Tools Execution Endpoint
app.post('/api/tools/execute', async (c) => {
  const body = await c.req.json();
  const { tool, params, userId } = body;

  try {
    const result = await toolOrchestrator.execute(tool, params, { userId });
    return c.json({ success: true, result });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// Model Switching Endpoint
app.post('/api/models/switch', async (c) => {
  const body = await c.req.json();
  const { userId, modelId, reason } = body;

  try {
    const mockSession = { id: 'current', userId, model: { id: 'old' } as any, context: [] };
    const result = await modelRouter.switchModel(mockSession, modelId, reason);
    return c.json({ success: true, result });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// Admin Metrics Endpoint
app.get('/api/admin/metrics', async (c) => {
  return c.json({
    activeUsers: 142,
    rpm: 350,
    latency: 120,
    errorRate: 0.05,
    timestamp: new Date()
  });
});

// Performance Metrics Endpoint
app.get('/api/metrics/performance', async (c) => {
  const metrics = await modelRouter.getMetrics();
  return c.json(metrics);
});

// Writing Studio: Complete Flow
app.post('/api/studio/complete', async (c) => {
  const body = await c.req.json();
  const { idea, options } = body;

  const result = await studio.createCompleteBook(idea);
  return c.json(result);
});

import embeddingsRoute from './routes/embeddings'
app.route('/', embeddingsRoute)

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
