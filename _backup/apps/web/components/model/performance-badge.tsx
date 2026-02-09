import React from 'react';

export function PerformanceBadge({ modelId }: { modelId: string }) {
    // Stub logic for random performance stats
    const latency = Math.floor(Math.random() * 50) + 10;

    return (
        <div className="mt-4 flex items-center gap-4 text-sm bg-background p-2 rounded">
            <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Latency</span>
                <span className="font-mono text-green-500">{latency}ms</span>
            </div>
            <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Cost/1k</span>
                <span className="font-mono">$0.00</span>
            </div>
            <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Quality</span>
                <span className="font-mono">98%</span>
            </div>
        </div>
    );
}
