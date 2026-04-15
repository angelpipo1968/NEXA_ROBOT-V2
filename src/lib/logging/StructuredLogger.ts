import { supabase } from '@/lib/supabase';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  context: string; // e.g., 'gemini', 'memory', 'voice', 'auth'
  action: string; // e.g., 'chat_start', 'memory_save', 'voice_init'
  data?: Record<string, any>;
  error?: string;
  userId?: string;
  conversationId?: string;
  timestamp: string;
}

/**
 * Structured Logger
 * Reemplaza console.log con eventos estructurados
 * Permite query/filter en producción
 */
export class StructuredLogger {
  private isDevelopment =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  /**
   * Log con contexto
   */
  log(
    level: LogLevel,
    context: string,
    action: string,
    data?: Record<string, any>,
    userId?: string
  ) {
    const entry: LogEntry = {
      level,
      context,
      action,
      data,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Console output (dev)
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      };
      console.log(
        `${emoji[level]} [${context}] ${action}`,
        data ? data : ''
      );
    }

    // Store in Supabase (async, non-blocking)
    this.storeLog(entry).catch((err) =>
      console.error('[Logger] Failed to store:', err)
    );
  }

  // Shortcuts
  debug(context: string, action: string, data?: Record<string, any>) {
    this.log('debug', context, action, data);
  }

  info(context: string, action: string, data?: Record<string, any>, userId?: string) {
    this.log('info', context, action, data, userId);
  }

  warn(context: string, action: string, data?: Record<string, any>) {
    this.log('warn', context, action, data);
  }

  error(context: string, action: string, error: string, data?: Record<string, any>) {
    this.log('error', context, action, { ...data, error }, data?.userId);
  }

  /**
   * Eventos de Gemini
   */
  geminiRequest(userId: string, conversationId: string, prompt: string) {
    this.info('gemini', 'request_start', {
      promptLength: prompt.length,
      conversationId,
    }, userId);
  }

  geminiSuccess(
    userId: string,
    conversationId: string,
    tokensUsed: number,
    latency: number,
    model: string
  ) {
    this.info('gemini', 'request_success', {
      tokensUsed,
      latency,
      model,
      conversationId,
    }, userId);
  }

  geminiFailed(
    userId: string,
    conversationId: string,
    error: string,
    attempt: number
  ) {
    this.warn('gemini', 'request_failed', {
      error,
      attempt,
      conversationId,
    });
  }

  /**
   * Eventos de Memoria
   */
  memorySave(userId: string, content: string, role: 'user' | 'assistant') {
    this.debug('memory', 'save_start', {
      contentLength: content.length,
      role,
    });
  }

  memorySaved(userId: string, memoryId: string) {
    this.info('memory', 'save_success', {
      memoryId,
    }, userId);
  }

  memoryConsolidate(userId: string, fragmentCount: number) {
    this.info('memory', 'consolidate_start', {
      fragmentCount,
    }, userId);
  }

  /**
   * Eventos de Voz
   */
  voiceStart(userId: string) {
    this.info('voice', 'recording_start', {}, userId);
  }

  voiceStop(userId: string, duration: number) {
    this.info('voice', 'recording_stop', {
      durationMs: duration,
    }, userId);
  }

  voiceSynthesis(userId: string, text: string, provider: string) {
    this.debug('voice', 'synthesis_start', {
      textLength: text.length,
      provider,
    });
  }

  /**
   * Eventos de Seguridad
   */
  securityBlock(userId: string, reason: string, input: string) {
    this.warn('security', 'input_blocked', {
      reason,
      inputLength: input.length,
    });
  }

  authSuccess(userId: string, provider: string) {
    this.info('auth', 'login_success', {
      provider,
    }, userId);
  }

  authFailed(userId: string, reason: string) {
    this.warn('auth', 'login_failed', {
      reason,
    });
  }

  /**
   * Eventos de Performance
   */
  performanceMetric(context: string, metric: string, value: number, unit: string) {
    this.debug('performance', `${context}_${metric}`, {
      value,
      unit,
    });
  }

  /**
   * Almacenar log en Supabase
   */
  private async storeLog(entry: LogEntry) {
    try {
      // Solo guardar ERROR y WARN en producción (ahorrar storage)
      if (this.isDevelopment || entry.level === 'error' || entry.level === 'warn') {
        const { error } = await supabase
          .from('activity_logs')
          .insert({
            level: entry.level,
            context: entry.context,
            action: entry.action,
            data: entry.data || {},
            error: entry.error,
            user_id: entry.userId,
            conversation_id: entry.conversationId,
            created_at: entry.timestamp,
          });

        if (error) {
          console.error('[Logger] Insert failed:', error);
        }
      }
    } catch (err) {
      // Silenciar: no bloquear aplicación por logging
    }
  }

  /**
   * Dashboard: Últimas N líneas de log
   */
  async getRecentLogs(limit: number = 100, level?: LogLevel) {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Logger] Failed to fetch logs:', err);
      return [];
    }
  }

  /**
   * Errores del día (para alertas)
   */
  async getErrorCount(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('count', { count: 'exact' })
        .eq('level', 'error')
        .gte('created_at', since.toISOString());

      if (error) throw error;
      return data ? data[0]?.count || 0 : 0;
    } catch (err) {
      console.error('[Logger] Failed to count errors:', err);
      return 0;
    }
  }
}

export const logger = new StructuredLogger();
