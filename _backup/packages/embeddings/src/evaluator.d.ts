export interface EvaluationResults {
    accuracy: number;
    precision: number;
    recall: number;
}
export declare class Evaluator {
    evaluate(model: any, options: any): Promise<EvaluationResults>;
}
//# sourceMappingURL=evaluator.d.ts.map