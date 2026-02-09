import { SecurityContext, DetectionResult } from './types';
export declare class InjectionDetector {
    private neuralHash;
    private patterns;
    private semantic;
    constructor();
    detect(input: string, context?: SecurityContext): Promise<DetectionResult>;
    private determineActions;
    private sanitizeInput;
}
//# sourceMappingURL=injection-detector.d.ts.map