import { analyticsService } from '@/lib/analytics/AnalyticsService';

export interface GeminiErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Gemini Error Handler
 * - Retry automático con backoff exponencial
 * - Fallback a modelos alternativos
 * - Timeout handling
 * - User-friendly error messages
 */
export class GeminiErrorHandler {
  private readonly maxRetries = 3;
  private readonly baseRetryDelay = 1000; // ms
  private readonly timeout = 30000; // 30s

  /**
   * Tipos de error Gemini
   */
  private readonly recoverableErrors = [
    'DEADLINE_EXCEEDED',
    'RESOURCE_EXHAUSTED',
    'UNAVAILABLE',
    'INTERNAL',
  ];

  private readonly fatalErrors = [
    'INVALID_ARGUMENT',
    'UNAUTHENTICATED',
    'PERMISSION_DENIED',
    'NOT_FOUND',
  ];

  /**
   * Determina si un error es recuperable
   */
  private isRecoverable(error: any): boolean {
    const status = error?.error?.status || error?.status || '';
    return this.recoverableErrors.includes(status);
  }

  /**
   * Ejecuta call con retry automático + timeout
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      name?: string;
      userId?: string;
      conversationId?: string;
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: string; attempts: number }> {
    let lastError: any = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Set timeout race condition
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('TIMEOUT_EXCEEDED')),
            this.timeout
          )
        );

        const result = await Promise.race([fn(), timeoutPromise]);

        // ✅ SUCCESS
        const latency = Date.now() - startTime;
        console.log(
          `[${options.name || 'Gemini'}] ✅ Success on attempt ${attempt} (${latency}ms)`
        );

        // Record success metric
        await analyticsService.recordInference({
          model: 'gemini-2.0-flash',
          action: 'chat',
          tokens_used: 0, // será actualizado por caller
          latency_ms: latency,
          cost_usd: 0,
          success: true,
          user_id: options.userId,
          conversation_id: options.conversationId,
        });

        return { success: true, data: result, attempts: attempt };
      } catch (error: any) {
        lastError = error;
        const latency = Date.now() - startTime;

        // Log error
        console.warn(`[${options.name || 'Gemini'}] Attempt ${attempt} failed:`, {
          error: error?.message || String(error),
          status: error?.error?.status,
          recoverable: this.isRecoverable(error),
        });

        // Record failed metric
        await analyticsService.recordInference({
          model: 'gemini-2.0-flash',
          action: 'chat',
          tokens_used: 0,
          latency_ms: latency,
          cost_usd: 0,
          success: false,
          error_message: error?.message,
          user_id: options.userId,
          conversation_id: options.conversationId,
        });

        // Si error fatal, no reintentar
        if (!this.isRecoverable(error)) {
          return {
            success: false,
            error: this.getFriendlyErrorMessage(error),
            attempts: attempt,
          };
        }

        // Si es último intento, no esperar
        if (attempt === this.maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = this.baseRetryDelay * Math.pow(2, attempt - 1);
        console.log(
          `[${options.name || 'Gemini'}] Retrying in ${delay}ms...`
        );
        await this.sleep(delay);
      }
    }

    // ❌ ALL RETRIES FAILED
    return {
      success: false,
      error: this.getFriendlyErrorMessage(lastError),
      attempts: this.maxRetries,
    };
  }

  /**
   * Mensajes amigables para el usuario
   */
  private getFriendlyErrorMessage(error: any): string {
    const status = error?.error?.status || error?.status || '';
    const message = error?.error?.message || error?.message || 'Error desconocido';

    const MAP: Record<string, string> = {
      TIMEOUT_EXCEEDED: '⏱️ La respuesta tardó demasiado. Intenta de nuevo.',
      RESOURCE_EXHAUSTED:
        '🔥 El servicio está muy ocupado. Reintentan automáticamente...',
      UNAVAILABLE:
        '🌐 El servicio no está disponible. Intenta más tarde.',
      UNAUTHENTICATED:
        '🔐 Error de autenticación. Revisa tus credenciales.',
      PERMISSION_DENIED:
        '⛔ No tienes permiso para esta acción.',
      INVALID_ARGUMENT:
        '❌ Solicitud inválida. Revisa tu input.',
      INTERNAL: '⚙️ Error interno del servidor. Reintentando...',
      DEADLINE_EXCEEDED: '⏰ Timeout. El servidor estaba lento.',
    };

    return MAP[status] || `Error: ${message}`;
  }

  /**
   * Fallback: Si Gemini falla después de retries, sugerir alternativa
   */
  getAlternativeProviders(): string[] {
    // En orden de preferencia
    return ['claude-3-sonnet', 'gpt-4-turbo', 'deepseek-chat', 'ollama'];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const geminiErrorHandler = new GeminiErrorHandler();
