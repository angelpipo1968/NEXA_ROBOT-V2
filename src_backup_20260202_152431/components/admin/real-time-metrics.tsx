import React from 'react';

export function RealTimeMetrics({ metrics }: { metrics: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Active Users</h3>
                <p className="text-2xl font-bold">{metrics.activeUsers || 0}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Requests/min</h3>
                <p className="text-2xl font-bold">{metrics.rpm || 0}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Avg Latency</h3>
                <p className="text-2xl font-bold">{metrics.latency || 0}ms</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Error Rate</h3>
                <p className="text-2xl font-bold text-green-500">{metrics.errorRate || 0}%</p>
            </div>
        </div>
    );
}
