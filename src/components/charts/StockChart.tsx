import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { StockHistoryData } from '@/lib/services/stockService';
import './StockChart.css';

interface StockChartProps {
    data: StockHistoryData[];
    symbol: string;
    isPositive: boolean;
}

export function StockChart({ data, symbol, isPositive }: StockChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="stock-chart-empty">
                <p>No historical data available</p>
            </div>
        );
    }

    // Format date for display (MM/DD)
    const formattedData = data.map(item => ({
        ...item,
        dateShort: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    const chartColor = isPositive ? '#10b981' : '#ef4444';

    return (
        <div className="stock-chart-container">
            <div className="stock-chart-header">
                <span className="stock-chart-title">7-Day Price History</span>
                <span className="stock-chart-symbol">{symbol}</span>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="dateShort"
                        stroke="rgba(255, 255, 255, 0.5)"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="rgba(255, 255, 255, 0.5)"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#fff', marginBottom: '4px' }}
                        formatter={(value?: number) => value !== undefined ? [`$${value.toFixed(2)}`, 'Price'] : ['N/A', 'Price']}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={chartColor}
                        strokeWidth={2}
                        fill={`url(#colorPrice-${symbol})`}
                        animationDuration={800}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="stock-chart-legend">
                <div className="stock-chart-legend-item">
                    <span className="legend-label">High:</span>
                    <span className="legend-value">${Math.max(...data.map(d => d.high)).toFixed(2)}</span>
                </div>
                <div className="stock-chart-legend-item">
                    <span className="legend-label">Low:</span>
                    <span className="legend-value">${Math.min(...data.map(d => d.low)).toFixed(2)}</span>
                </div>
                <div className="stock-chart-legend-item">
                    <span className="legend-label">Avg:</span>
                    <span className="legend-value">${(data.reduce((sum, d) => sum + d.price, 0) / data.length).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
