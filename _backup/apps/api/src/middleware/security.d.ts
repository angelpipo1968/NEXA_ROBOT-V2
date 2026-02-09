import { Context, Next } from 'hono';
export declare const securityMiddleware: () => (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
    retryAfter: number;
}, 429, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
    requestId: string;
}, 403, "json">) | undefined>;
//# sourceMappingURL=security.d.ts.map