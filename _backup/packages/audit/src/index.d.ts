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
export declare class AuditLogger {
    logRequest(options: AuditLogOptions): Promise<void>;
    logBlock(options: AuditLogOptions): Promise<void>;
    logThreat(options: AuditLogOptions): Promise<void>;
    logResponse(options: AuditLogOptions): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map