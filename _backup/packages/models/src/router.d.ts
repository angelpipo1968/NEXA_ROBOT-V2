import { Model, ModelResponse, ModelRequest, RoutingOptions, SwitchResult } from './types';
interface Session {
    id: string;
    userId: string;
    model: Model;
    context: any[];
}
export declare class ModelRouter {
    private providers;
    private monitor;
    private cache;
    constructor();
    private initializeProviders;
    route(request: ModelRequest, options?: RoutingOptions): Promise<ModelResponse>;
    private selectOptimalModel;
    switchModel(currentSession: Session, newModelId: string, reason?: string): Promise<SwitchResult>;
    getAvailableModels(userId: string, filter?: any): Promise<Model[]>;
    private checkAvailability;
    private routeWithFallback;
    private executeWithModel;
    private evaluateQuality;
    private updateUserPreferences;
    private getModel;
}
export {};
//# sourceMappingURL=router.d.ts.map