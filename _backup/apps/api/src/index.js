"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const memory_1 = require("@nexa/memory");
const core_1 = require("@nexa/core");
const security_1 = require("./middleware/security");
const tools_1 = require("@nexa/tools");
const models_1 = require("@nexa/models");
const app = new hono_1.Hono();
// Services
const toolOrchestrator = new tools_1.ToolOrchestrator();
const modelRouter = new models_1.ModelRouter();
app.use('/*', (0, cors_1.cors)());
app.use('/api/*', security_1.securityMiddleware);
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Chat Endpoint
app.post('/api/chat', async (c) => {
    const body = await c.req.json();
    const { message, userId, context } = body;
    // 1. Safety Check (Pre-LLM)
    const safety = await core_1.safetyFilter.validate(message);
    if (!safety.allowed) {
        return c.json({ error: 'Safety violation', reason: safety.reason }, 400);
    }
    // 2. Memory Retrieval
    const userMemory = await memory_1.memoryManager.retrieve(userId, message);
    // 3. Model Routing
    const response = await modelRouter.route({
        userId,
        message,
        context: [...(context || []), ...userMemory],
        priority: body.priority || 'balanced'
    });
    // 4. Memory Update
    await memory_1.memoryManager.update(userId, { query: message, response: response.text });
    return c.json({
        response: response.text,
        metadata: {
            model: 'routed-model', // dynamic
            latency: response.latency,
            cost: response.cost
        }
    });
});
// Tools Execution Endpoint
app.post('/api/tools/execute', async (c) => {
    const body = await c.req.json();
    const { tool, params, userId } = body;
    try {
        const result = await toolOrchestrator.execute(tool, params, { userId });
        return c.json({ success: true, result });
    }
    catch (e) {
        return c.json({ success: false, error: e.message }, 500);
    }
});
// Model Switching Endpoint
app.post('/api/models/switch', async (c) => {
    const body = await c.req.json();
    const { userId, modelId, reason } = body;
    try {
        // In a real generic session, we would need session ID. Stubbing session for now.
        const mockSession = { id: 'current', userId, model: { id: 'old' }, context: [] }; // Stub
        const result = await modelRouter.switchModel(mockSession, modelId, reason);
        return c.json({ success: true, result });
    }
    catch (e) {
        return c.json({ success: false, error: e.message }, 500);
    }
});
// Admin Metrics Endpoint
app.get('/api/admin/metrics', async (c) => {
    // Return stub/real metrics
    return c.json({
        activeUsers: 142,
        rpm: 350,
        latency: 120,
        errorRate: 0.05,
        timestamp: new Date()
    });
});
const embeddings_1 = __importDefault(require("./routes/embeddings"));
app.route('/', embeddings_1.default);
// WebSocket stub (Hono node server support varies, keep simple generic response for now or separate server)
// For now, we assume WS is handled by a separate entry or upgrade handler not fully shown here.
const port = 3001;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
});
//# sourceMappingURL=index.js.map