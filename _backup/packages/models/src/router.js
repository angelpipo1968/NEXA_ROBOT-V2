"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
const stubs_1 = require("./providers/stubs");
const monitor_1 = require("./monitor");
const cache_1 = require("./cache");
class ModelRouter {
    constructor() {
        this.providers = new Map();
        this.monitor = new monitor_1.PerformanceMonitor();
        this.cache = new cache_1.ModelCache();
        this.initializeProviders();
    }
    initializeProviders() {
        // Proveedores locales
        this.providers.set('ollama', new stubs_1.OllamaProvider());
        // Proveedores cloud
        this.providers.set('openai', new stubs_1.OpenAICloud());
        this.providers.set('anthropic', new stubs_1.AnthropicProvider());
        // Modelos locales optimizados
        this.providers.set('local', new stubs_1.LocalProvider());
    }
    async route(request, options = {}) {
        const { userId, message, context, requirements, budget, priority = 'balanced' } = request;
        // 1. Determinar modelo óptimo
        const selectedModel = await this.selectOptimalModel({
            message,
            context,
            requirements,
            budget,
            priority,
            userId
        });
        const model = selectedModel.model;
        // 2. Verificar disponibilidad
        const available = await this.checkAvailability(model);
        if (!available) {
            // Fallback automático
            return await this.routeWithFallback(request, model);
        }
        // 3. Ejecutar con modelo seleccionado
        const response = await this.executeWithModel(model, request);
        // 4. Monitorear performance
        await this.monitor.record({
            model: model.id,
            userId,
            latency: response.latency,
            tokens: response.usage?.totalTokens,
            cost: response.cost,
            quality: await this.evaluateQuality(response)
        });
        // 5. Actualizar preferencias del usuario
        await this.updateUserPreferences(userId, model, response);
        return response;
    }
    async selectOptimalModel(criteria) {
        // Análisis multi-factor stub
        const factors = {
            complexity: 0.5,
            budget: true,
            preferences: {},
            history: {}
        };
        // Scoring de modelos disponibles - STUB logic getting first available
        const models = await this.getAvailableModels(criteria.userId);
        const model = models[0];
        return { model, score: 0.9 };
    }
    async switchModel(currentSession, newModelId, reason) {
        const newModel = this.getModel(newModelId);
        if (!newModel)
            throw new Error("Model not found");
        // Transferir contexto STUB
        const transferredContext = currentSession.context;
        // Iniciar nueva sesión STUB
        const newSession = {
            ...currentSession,
            model: newModel,
            context: transferredContext
        };
        return {
            success: true,
            newSession,
            transferredContext: transferredContext.length,
            warnings: []
        };
    }
    async getAvailableModels(userId, filter) {
        const allModels = Array.from(this.providers.values())
            .flatMap(p => p.getModels());
        return allModels;
    }
    // Helpers to satisfy interface
    async checkAvailability(model) { return true; }
    async routeWithFallback(req, model) { return { text: "Fallback", latency: 0, cost: 0 }; }
    async executeWithModel(model, request) {
        const provider = this.providers.get(model.provider) || this.providers.get('local');
        if (!provider)
            throw new Error("Provider not found");
        return provider.execute(request);
    }
    async evaluateQuality(response) { return 0.9; }
    async updateUserPreferences(userId, model, response) { }
    getModel(id) {
        return this.getAvailableModels('stub').find(m => m.id === id);
    }
}
exports.ModelRouter = ModelRouter;
//# sourceMappingURL=router.js.map