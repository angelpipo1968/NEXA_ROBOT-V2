import { supabase } from '@/lib/supabase';

export interface InferenceMetric {
  model: string;
  action: 'chat' | 'embedding' | 'image_generation';
  tokens_used: number;
  latency_ms: number;
  cost_usd: number;
  success: boolean;
  error_message?: string;
  user_id?: string;
  conversation_id?: string;
}

/**
 * Analytics Service
 * Registra métricas de inferencia para:
 * - Análisis de costos
 * - Debugging de performance
 * - Dashboard de uso
 */
export class AnalyticsService {
  // Precios aproximados (actualizar según contratos)
  private readonly modelPricing = {
    'gemini-2.0-flash': { input: 0.075, output: 0.3 }, // por millón de tokens
    'gemini-2.5-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-pro': { input: 3.5, output: 10.5 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    'text-embedding-004': { input: 0.025, output: 0 }, // flat rate
    'gpt-4': { input: 3, output: 6 },
    'gpt-4-turbo': { input: 1, output: 3 },
    'claude-3-opus': { input: 3, output: 15 },
    'claude-3-sonnet': { input: 0.3, output: 1.5 },
    'deepseek-chat': { input: 0.14, output: 0.28 },
    'ollama': { input: 0, output: 0 }, // local
  };

  /**
   * Calcula costo de una inferencia
   */
  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.modelPricing[model as keyof typeof this.modelPricing];
    if (!pricing) return 0; // modelo desconocido

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Registra métrica de inferencia
   */
  async recordInference(metric: InferenceMetric) {
    try {
      const { error } = await supabase
        .from('inference_metrics')
        .insert({
          model: metric.model,
          action: metric.action,
          tokens_used: metric.tokens_used,
          latency_ms: metric.latency_ms,
          cost_usd: metric.cost_usd,
          success: metric.success,
          error_message: metric.error_message,
          user_id: metric.user_id,
          conversation_id: metric.conversation_id,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('[Analytics] Error registering metric:', error);
      }
    } catch (err) {
      console.error('[Analytics] Failed to record inference:', err);
      // No throw: no bloquear si analytics falla
    }
  }

  /**
   * Dashboard: Estadísticas diarias
   */
  async getDailyStats(userId?: string) {
    try {
      let query = supabase
        .from('inference_metrics')
        .select(
          `model, 
           sum(tokens_used)::int as total_tokens, 
           sum(cost_usd)::numeric as total_cost,
           avg(latency_ms)::numeric as avg_latency_ms,
           count(*) as request_count,
           sum(case when success = true then 1 else 0 end)::int as success_count`
        )
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .group_by('model');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Analytics] Failed to fetch daily stats:', err);
      return [];
    }
  }

  /**
   * Estadísticas por modelo (últimos 7 días)
   */
  async getModelComparison() {
    try {
      const { data, error } = await supabase
        .from('inference_metrics')
        .select(
          `model,
           avg(latency_ms)::numeric as avg_latency,
           sum(cost_usd)::numeric as total_cost,
           count(*) as usage_count`
        )
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .group_by('model')
        .order('total_cost', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Analytics] Failed to compare models:', err);
      return [];
    }
  }

  /**
   * Alertas: Si costo diario > threshold
   */
  async checkCostThreshold(threshold: number = 5.0) {
    const stats = await this.getDailyStats();
    const totalCost = stats.reduce(
      (sum: number, stat: any) => sum + (Number(stat.total_cost) || 0),
      0
    );

    if (totalCost > threshold) {
      console.warn(
        `[Analytics Alert] Daily cost (${totalCost.toFixed(2)}) exceeds threshold ($${threshold})`
      );
      return { exceeded: true, currentCost: totalCost, threshold };
    }

    return { exceeded: false, currentCost: totalCost, threshold };
  }

  /**
   * Reset: Limpiar métricas antiguas (> 30 días)
   */
  async cleanupOldMetrics() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { error } = await supabase
        .from('inference_metrics')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
      console.log('[Analytics] Cleaned up metrics older than 30 days');
    } catch (err) {
      console.error('[Analytics] Cleanup failed:', err);
    }
  }
}

export const analyticsService = new AnalyticsService();
