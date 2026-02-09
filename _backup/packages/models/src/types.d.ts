export interface Model {
    id: string;
    name: string;
    provider: string;
    capabilities: ModelCapabilities;
    recommendationReason?: string;
}
export interface ModelCapabilities {
    contextLength: number;
    streaming: boolean;
    functionCalling: boolean;
    vision?: boolean;
}
export interface ModelRequest {
    userId: string;
    message: string;
    context?: any[];
    requirements?: any;
    budget?: number;
    priority?: 'balanced' | 'speed' | 'quality' | 'cost';
}
export interface ModelResponse {
    text: string;
    latency: number;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    cost: number;
}
export interface RoutingOptions {
    forceModel?: string;
    timeout?: number;
}
export interface SelectedModel {
    model: Model;
    score: number;
}
export interface SwitchResult {
    success: boolean;
    newSession: any;
    transferredContext: number;
    warnings?: string[];
}
//# sourceMappingURL=types.d.ts.map