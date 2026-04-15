import { useCallback, useState } from 'react';
import { inputValidator } from '@/lib/security/InputValidator';
import { logger } from '@/lib/logging/StructuredLogger';
import { analyticsService } from '@/lib/analytics/AnalyticsService';
import { geminiClient } from '@/lib/gemini';

export interface ImprovedChatHookResult {
  sendMessage: (message: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  stats: {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    todayCost: number;
  };
}

/**
 * useImprovedChat Hook
 * Integra: validación + logging + analytics + error handling
 */
export function useImprovedChat(
  userId: string,
  conversationId: string
): ImprovedChatHookResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    todayCost: 0,
  });

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        // ✅ 1. VALIDATE INPUT
        const validation = inputValidator.validate(message);
        if (!validation.safe) {
          const errorMsg = validation.reason || 'Input validation failed';
          setError(errorMsg);
          inputValidator.logAttempt(message, validation, userId);
          logger.securityBlock(userId, errorMsg, message);
          throw new Error(errorMsg);
        }

        // ✅ 2. LOG REQUEST START
        logger.geminiRequest(userId, conversationId, message);

        // ✅ 3. SEND TO GEMINI (con retry automático y timeout)
        const startTime = Date.now();
        const response = await geminiClient.chat(
          {
            message,
            temperature: 0.7,
          },
          userId,
          conversationId
        );

        const responseText = await response.text();
        const latency = Date.now() - startTime;

        // ✅ 4. PARSE RESPONSE
        let assistantMessage = responseText;
        try {
          const parsed = JSON.parse(responseText);
          assistantMessage =
            parsed?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Sin respuesta del modelo';
        } catch {
          // Already text format
        }

        // ✅ 5. LOG SUCCESS
        logger.geminiSuccess(
          userId,
          conversationId,
          0,
          latency,
          'gemini-2.0-flash'
        );

        // ✅ 6. UPDATE STATS
        setStats((prev) => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successRate:
            (prev.successRate * prev.totalRequests + 100) /
            (prev.totalRequests + 1),
          avgLatency:
            (prev.avgLatency * prev.totalRequests + latency) /
            (prev.totalRequests + 1),
          todayCost: prev.todayCost + 0.00045, // Aprox Gemini Flash
        }));

        // ✅ 7. FETCH DAILY STATS (async)
        analyticsService.getDailyStats(userId).then((data) => {
          const totalCost = data.reduce(
            (sum: number, stat: any) => sum + (Number(stat.total_cost) || 0),
            0
          );
          setStats((prev) => ({ ...prev, todayCost: totalCost }));
        });

        return assistantMessage;
      } catch (err: any) {
        const errorMsg = err.message || 'Error desconocido';
        setError(errorMsg);
        logger.error(
          'chat',
          'send_message_failed',
          errorMsg,
          { userId, conversationId }
        );

        // Update success rate
        setStats((prev) => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successRate:
            (prev.successRate * prev.totalRequests) /
            (prev.totalRequests + 1),
        }));

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, conversationId]
  );

  return {
    sendMessage,
    loading,
    error,
    stats,
  };
}
