import { Model, ModelResponse, ModelRequest } from '../types';
export interface ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
}
export declare class OllamaProvider implements ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
}
export declare class OpenAICloud implements ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
}
export declare class AnthropicProvider implements ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
}
export declare class LocalProvider implements ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
}
//# sourceMappingURL=stubs.d.ts.map