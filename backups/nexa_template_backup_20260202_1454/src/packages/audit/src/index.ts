export interface AuditLogOptions {
    requestId: string;
    userId?: string;
    ip?: string;
    endpoint?: string;
    method?: string;
    timestamp?: Date;
    status?: number;
    responseTime?: number;
    reason?: string;
    details?: any;
    threat?: any;
    confidence?: number;
    input?: string;
}

export class AuditLogger {
    async logRequest(options: AuditLogOptions) {
        console.log(`[AUDIT] Request: ${JSON.stringify(options)}`);
    }

    async logBlock(options: AuditLogOptions) {
        console.log(`[AUDIT] Blocked: ${JSON.stringify(options)}`);
    }

    async logThreat(options: AuditLogOptions) {
        console.warn(`[AUDIT] THREAT DETECTED: ${JSON.stringify(options)}`);
    }

    async logResponse(options: AuditLogOptions) {
        console.log(`[AUDIT] Response: ${JSON.stringify(options)}`);
    }
}
