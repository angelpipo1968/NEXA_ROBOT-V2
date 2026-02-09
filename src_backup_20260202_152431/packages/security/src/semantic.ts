export class SemanticAnalyzer {
    async analyze(input: string, context?: any) {
        return { scores: { injection: 0, jailbreak: 0, privilege: 0 } };
    }
}
