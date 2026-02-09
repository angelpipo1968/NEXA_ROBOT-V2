export interface TrainingOptions {
    baseModel: string;
    dataset: any[];
    losses: string[];
    epochs: number;
    batchSize: number;
    learningRate: number;
    validationSplit: number;
}
export declare class Trainer {
    train(options: TrainingOptions): Promise<any>;
}
//# sourceMappingURL=trainer.d.ts.map