export class PatternDetector {
    async scan(input: string) {
        return { scores: { injection: 0, jailbreak: 0, privilege: 0 } };
    }
}
