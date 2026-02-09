'use client'

import { useState, useEffect } from 'react'
import { SecurityMonitor } from '@/components/admin/security-monitor'
import { ModelPerformance } from '@/components/admin/model-performance'
import { ToolUsage } from '@/components/admin/tool-usage'
import { RealTimeMetrics } from '@/components/admin/real-time-metrics'

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<any>({
        activeUsers: 142,
        rpm: 350,
        latency: 120,
        errorRate: 0.05
    })
    const [threats, setThreats] = useState<any[]>([])

    useEffect(() => {
        // Stub WS connection for demo
        const interval = setInterval(() => {
            setMetrics((prev: any) => ({
                ...prev,
                rpm: prev.rpm + Math.floor(Math.random() * 20 - 10),
                latency: Math.max(50, prev.latency + Math.floor(Math.random() * 20 - 10))
            }))
        }, 2000);

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Nexa AI Admin Dashboard</h1>

            {/* Métricas en tiempo real */}
            <RealTimeMetrics metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monitor de seguridad */}
                <div className="border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Security Monitor</h2>
                    <SecurityMonitor threats={threats} />
                </div>

                {/* Performance de modelos */}
                <div className="border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Model Performance</h2>
                    <ModelPerformance />
                </div>

                {/* Uso de herramientas */}
                <div className="border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Tool Usage</h2>
                    <ToolUsage />
                </div>

                {/* Model switching stats */}
                <div className="border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Model Switching</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm">
                                <span>Total Switches</span>
                                <span className="font-mono">1,234</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Auto Switches</span>
                                <span className="font-mono">892</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Manual Switches</span>
                                <span className="font-mono">342</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
