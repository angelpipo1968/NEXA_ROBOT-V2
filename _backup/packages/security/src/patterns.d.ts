export declare class PatternDetector {
    scan(input: string): Promise<{
        scores: {
            injection: number;
            jailbreak: number;
            privilege: number;
        };
    }>;
}
//# sourceMappingURL=patterns.d.ts.map