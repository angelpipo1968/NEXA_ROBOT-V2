export interface MetricPoint {
    latency: number;
    tokenCount: number;
    tokensPerSecond: number;
    timestamp: number;
}

export interface OptimizationAction {
    action: string;
    model: string;
    from?: string;
    to?: string;
    expectedImprovement: string;
    confidence: number;
    parameters?: any;
}

export class PerformanceMonitor {
    private metrics = new Map<string, MetricPoint[]>();

    async record(metric: any): Promise<void> {
        const model = metric.model || 'unknown';
        const points = this.metrics.get(model) || [];
        points.push({
            latency: metric.latency,
            tokenCount: metric.tokens || 0,
            tokensPerSecond: metric.tokens ? (metric.tokens / (metric.latency / 1000)) : 0,
            timestamp: Date.now()
        });

        // Keep last 100 points
        if (points.length > 100) points.shift();
        this.metrics.set(model, points);

        console.log(`[Monitor] Recorded metric for ${model}: ${metric.latency}ms, ${points[points.length - 1].tokensPerSecond.toFixed(2)} TPS`);
    }

    getTPS(modelId?: string): number {
        if (modelId) {
            const points = this.metrics.get(modelId);
            return points && points.length > 0 ? points[points.length - 1].tokensPerSecond : 0;
        }
        // Average TPS across all models
        const allPoints = Array.from(this.metrics.values()).flat();
        if (allPoints.length === 0) return 0;
        return allPoints.reduce((acc, p) => acc + p.tokensPerSecond, 0) / allPoints.length;
    }

    getOptimizationRecommendations(): OptimizationAction[] {
        const recommendations: OptimizationAction[] = [];

        for (const [model, points] of this.metrics.entries()) {
            if (points.length === 0) continue;

            const avgLatency = points.reduce((acc, p) => acc + p.latency, 0) / points.length;

            if (avgLatency > 5000 && model === 'llama3.2:3b') {
                recommendations.push({
                    action: 'switch_model',
                    model: 'llama3.2:3b',
                    from: 'llama3.2:3b',
                    to: 'llama3.2:1b',
                    expectedImprovement: '2.5x speed',
                    confidence: 0.85
                });
            }
        }

        return recommendations;
    }

    getAllMetrics() {
        return Object.fromEntries(this.metrics);
    }
}
