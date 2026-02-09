export declare class SemanticAnalyzer {
    analyze(input: string, context?: any): Promise<{
        scores: {
            injection: number;
            jailbreak: number;
            privilege: number;
        };
    }>;
}
//# sourceMappingURL=semantic.d.ts.map