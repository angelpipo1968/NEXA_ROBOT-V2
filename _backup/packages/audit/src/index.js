"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
class AuditLogger {
    async logRequest(options) {
        console.log(`[AUDIT] Request: ${JSON.stringify(options)}`);
    }
    async logBlock(options) {
        console.log(`[AUDIT] Blocked: ${JSON.stringify(options)}`);
    }
    async logThreat(options) {
        console.warn(`[AUDIT] THREAT DETECTED: ${JSON.stringify(options)}`);
    }
    async logResponse(options) {
        console.log(`[AUDIT] Response: ${JSON.stringify(options)}`);
    }
}
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=index.js.map