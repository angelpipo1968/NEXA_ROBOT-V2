import { EvaluationResults } from './evaluator';
interface DomainDataset {
    domain: string;
    documents: string[];
}
interface FineTuneOptions {
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    validationSplit?: number;
}
interface FineTunedModel {
    model: any;
    evaluation: EvaluationResults;
    metadata: any;
}
interface TrainingSample {
    anchor: string;
    positive: string;
    negative: string;
}
interface OptimizedModel {
    id: string;
    size: number;
    accuracy: number;
}
export declare class DomainFineTuner {
    private trainer;
    private dataset;
    private evaluator;
    constructor();
    fineTune(baseModel: string, domainData: DomainDataset, options?: FineTuneOptions): Promise<FineTunedModel>;
    prepareDataset(data: DomainDataset, baseModel: string): Promise<TrainingSample[]>;
    optimizeForProduction(model: any, evaluation: EvaluationResults): Promise<OptimizedModel>;
    private registerModel;
    private chunkDocument;
    private getNegativeExample;
    private augmentData;
    private quantizeModel;
    private pruneModel;
    private compileModel;
}
export {};
//# sourceMappingURL=finetune.d.ts.map