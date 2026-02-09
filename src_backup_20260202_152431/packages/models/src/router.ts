import { Model, ModelCapabilities, ModelResponse, ModelRequest, RoutingOptions, SelectedModel, SwitchResult, StreamChunk, ModelCapabilities as MC } from './types'
import { OllamaProvider, OpenAICloud, AnthropicProvider, LocalProvider, ModelProvider } from './providers/stubs'
import { PerformanceMonitor } from './monitor'
import { ModelCache } from './cache'
import { StreamingCache } from './cache/stream-cache'
import { ModelLoadBalancer } from './load-balancer'

interface Session { // Stub session
    id: string;
    userId: string;
    model: Model;
    context: any[];
}

interface SelectionCriteria {
    message: string;
    context?: any[];
    requirements?: any;
    budget?: number;
    priority: string;
    userId: string;
}

export class ModelRouter {
    private providers: Map<string, ModelProvider>
    private monitor: PerformanceMonitor
    private cache: ModelCache
    private streamingCache: StreamingCache
    private loadBalancer: ModelLoadBalancer

    constructor() {
        this.providers = new Map()
        this.monitor = new PerformanceMonitor()
        this.cache = new ModelCache()
        this.streamingCache = new StreamingCache()
        this.loadBalancer = new ModelLoadBalancer()

        this.initializeProviders()
    }

    private initializeProviders() {
        // Proveedores locales
        this.providers.set('ollama', new OllamaProvider())

        // Proveedores cloud
        this.providers.set('openai', new OpenAICloud())
        this.providers.set('anthropic', new AnthropicProvider())

        // Modelos locales optimizados
        this.providers.set('local', new LocalProvider())
    }

    async route(
        request: ModelRequest,
        options: RoutingOptions = {}
    ): Promise<ModelResponse> {
        const {
            userId,
            message,
            context,
            requirements,
            budget,
            priority = 'balanced'
        } = request

        // 1. Determinar modelo óptimo
        const selectedModel = await this.selectOptimalModel({
            message,
            context,
            requirements,
            budget,
            priority,
            userId
        })

        const model = selectedModel.model;

        // 2. Verificar disponibilidad
        const available = await this.checkAvailability(model)
        if (!available) {
            // Fallback automático
            return await this.routeWithFallback(request, model)
        }

        // 3. Ejecutar con modelo seleccionado
        const response = await this.executeWithModel(model, request)

        // 4. Monitorear performance
        await this.monitor.record({
            model: model.id,
            userId,
            latency: response.latency,
            tokens: response.usage?.totalTokens,
            cost: response.cost,
            quality: await this.evaluateQuality(response)
        })

        // 5. Actualizar preferencias del usuario
        await this.updateUserPreferences(userId, model, response)

        return {
            ...response,
            modelId: model.id
        }
    }

    async *stream(
        request: ModelRequest,
        options: RoutingOptions = {}
    ): AsyncIterable<StreamChunk> {
        const {
            userId,
            message,
            context,
            requirements,
            budget,
            priority = 'balanced'
        } = request

        // 1. Check Streaming Cache
        const cacheGenerator = this.streamingCache.getOrStream(
            message,
            this.streamInternal(request, options)
        );

        yield* cacheGenerator;
    }

    private async *streamInternal(
        request: ModelRequest,
        options: RoutingOptions = {}
    ): AsyncIterable<StreamChunk> {
        const priority = request.priority as 'speed' | 'quality' | 'balanced' || 'balanced';

        // 1. Load Balance / Select optimal model
        const modelId = await this.loadBalancer.selectModel(priority);
        const model = this.getModel(modelId) || (await this.getAvailableModels(request.userId))[0];

        // 2. Execute with selected model (streaming)
        const provider = this.providers.get(model.provider) || this.providers.get('ollama');
        if (!provider) throw new Error("Provider not found");

        const start = Date.now();
        let tokens = 0;

        try {
            for await (const chunk of provider.streamExecute({
                ...request,
                requirements: { ...request.requirements, modelId: model.id }
            })) {
                tokens++;
                yield chunk;

                if (chunk.done) {
                    // 3. Monitor performance
                    await this.monitor.record({
                        model: model.id,
                        userId: request.userId,
                        latency: Date.now() - start,
                        tokens: chunk.usage?.totalTokens || tokens,
                        cost: 0
                    });
                }
            }
        } finally {
            this.loadBalancer.release(model.id);
        }
    }

    private async selectOptimalModel(
        criteria: SelectionCriteria
    ): Promise<SelectedModel> {
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

    async switchModel(
        currentSession: Session,
        newModelId: string,
        reason?: string
    ): Promise<SwitchResult> {
        const newModel = this.getModel(newModelId)
        if (!newModel) throw new Error("Model not found");

        // Transferir contexto STUB
        const transferredContext = currentSession.context;

        // Iniciar nueva sesión STUB
        const newSession = {
            ...currentSession,
            model: newModel,
            context: transferredContext
        }

        return {
            success: true,
            newSession,
            transferredContext: transferredContext.length,
            warnings: []
        }
    }

    async getAvailableModels(
        userId: string,
        filter?: any
    ): Promise<Model[]> {
        const allModels = Array.from(this.providers.values())
            .flatMap(p => p.getModels())
        return allModels;
    }

    async getMetrics() {
        return {
            streaming: {
                activeConnections: 0, // Placeholder
                tokensPerSecond: this.monitor.getTPS(),
                avgLatency: 0 // Placeholder
            },
            performance: this.monitor.getAllMetrics(),
            recommendations: this.monitor.getOptimizationRecommendations()
        };
    }

    // Helpers to satisfy interface
    private async checkAvailability(model: Model) { return true; }
    private async routeWithFallback(req: any, model: any) { return { text: "Fallback", latency: 0, cost: 0 }; }
    private async executeWithModel(model: Model, request: any) {
        const provider = this.providers.get(model.provider) || this.providers.get('local');
        if (!provider) throw new Error("Provider not found");
        return provider.execute(request);
    }
    private async evaluateQuality(response: any) { return 0.9; }
    private async updateUserPreferences(userId: string, model: any, response: any) { }
    private getModel(id: string) {
        return (this.getAvailableModels('stub') as unknown as Model[]).find(m => m.id === id);
    }
}
