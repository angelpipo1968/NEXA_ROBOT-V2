import { Context, Next } from 'hono'
import { InjectionDetector } from '@nexa/security'
import { AdaptiveRateLimiter } from '@nexa/security'
import { AuditLogger } from '@nexa/audit'

export const securityMiddleware = () => {
    const detector = new InjectionDetector()
    const limiter = new AdaptiveRateLimiter()
    const logger = new AuditLogger()

    return async (c: Context, next: Next) => {
        // Basic types for Context usually have variables in a specific way in Hono, 
        // but the user provided code uses c.get('user') and headers comfortably.
        // We might need to extend Context if TypeScript complains, but let's try strict implementation first.

        const requestId = crypto.randomUUID()
        // Type assertion or loose access might be needed for 'user' if not defined in Hono Variables
        const user = c.get('user') as any;
        const userId = user?.id || c.req.header('x-user-id')
        const ip = c.req.header('x-forwarded-for') || 'unknown'

        // 1. Log de entrada
        await logger.logRequest({
            requestId,
            userId,
            ip,
            endpoint: c.req.path,
            method: c.req.method,
            timestamp: new Date()
        })

        // 2. Rate limiting adaptativo
        const limitResult = await limiter.check(
            `${userId}:${ip}`,
            c.req.path,
            {
                // options if any
            }
        )

        if (!limitResult.allowed) {
            await logger.logBlock({
                requestId,
                reason: 'rate_limit',
                details: limitResult
            })

            return c.json({
                error: 'Rate limit exceeded',
                retryAfter: limitResult.retryAfter
            }, 429)
        }

        // 3. Detección de inyección (solo para POST con body)
        if (c.req.method === 'POST' && c.req.path.includes('/api/')) {
            try {
                const body = await c.req.json().catch(() => ({})) // Safe parse
                const text = JSON.stringify(body)

                const injectionCheck = await detector.detect(text, {
                    userId: String(userId),
                    endpoint: c.req.path,
                    requestId
                })

                if (!injectionCheck.allowed) {
                    await logger.logThreat({
                        requestId,
                        userId,
                        threat: injectionCheck.threats,
                        confidence: injectionCheck.confidence,
                        input: text.substring(0, 500)
                    })

                    // Ejecutar acciones de seguridad
                    for (const action of injectionCheck.actions) {
                        if (action.type === 'block') {
                            // We need to return here.
                            return c.json({
                                error: 'Security violation detected',
                                requestId
                            }, 403)
                        }
                    }

                    // Reemplazar input sanitizado is tricky in Hono as req.json() reads body once.
                    // However, we can construct a new request or just modify the body for downstream if we passed it.
                    // But Hono's c.req.json is a function. Overriding it:
                    /* 
                    // This is advanced and might require type casting
                    */
                    if (injectionCheck.sanitized) {
                        const sanitizedBody = JSON.parse(injectionCheck.sanitized);
                        // Dangerous cast to override readonly method, but user asked for it.
                        Object.defineProperty(c.req, 'json', {
                            value: () => Promise.resolve({
                                ...body,
                                message: sanitizedBody.message || injectionCheck.sanitized
                            })
                        });
                    }
                }
            } catch (e) {
                // Body parsing error or other issue
                console.error(e);
            }
        }

        // 4. Headers de seguridad
        c.header('X-Request-ID', requestId)
        c.header('X-Security-Level', 'high')
        c.header('X-Content-Type-Options', 'nosniff')
        c.header('X-Frame-Options', 'DENY')
        const start = Date.now();

        // 5. Continuar
        await next()

        // 6. Log de salida
        await logger.logResponse({
            requestId,
            status: c.res.status,
            responseTime: Date.now() - start
        })
    }
}
