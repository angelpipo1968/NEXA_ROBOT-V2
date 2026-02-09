export interface SecurityContext {
    userId?: string;
    sessionId?: string;
    metadata?: any;
}
export interface SecurityAction {
    type: 'block' | 'sanitize' | 'rate_limit' | 'log';
    level: 'high' | 'medium' | 'low' | 'auto';
    message?: string;
    log?: boolean;
    alert?: boolean;
    window?: string;
    max?: number;
}
export interface DetectionResult {
    allowed: boolean;
    threats: string[];
    confidence: number;
    actions: SecurityAction[];
    sanitized: string;
}
//# sourceMappingURL=types.d.ts.map