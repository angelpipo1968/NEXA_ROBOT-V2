import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatLargeNumber, fetchStockHistory, StockHistoryData } from '@/lib/services/stockService';
import type { StockData } from '@/lib/services/stockService';
import { StockChart } from '@/components/charts/StockChart';
import { cardVariants, hoverVariants, animateNumber } from '@/lib/animations';

interface StockCardProps {
    stock: StockData;
}

export function StockCard({ stock }: StockCardProps) {
    const isPositive = stock.change >= 0;
    const changeColor = isPositive ? 'stock-positive' : 'stock-negative';
    const changeIcon = isPositive ? '📈' : '📉';

    const [historyData, setHistoryData] = useState<StockHistoryData[] | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Animated price state
    const [displayPrice, setDisplayPrice] = useState(stock.price);

    // Fetch price history on mount
    useEffect(() => {
        async function loadHistory() {
            setIsLoadingHistory(true);
            setHistoryError(null);
            try {
                const data = await fetchStockHistory(stock.symbol, 7);
                setHistoryData(data);
            } catch (error) {
                console.error('Failed to load stock history:', error);
                setHistoryError(error instanceof Error ? error.message : 'Failed to load chart');
            } finally {
                setIsLoadingHistory(false);
            }
        }
        loadHistory();
    }, [stock.symbol]);

    // Animate price on mount
    useEffect(() => {
        animateNumber(0, stock.price, 1000, (value) => {
            setDisplayPrice(value);
        });
    }, [stock.price]);

    return (
        <motion.div
            className="stock-card-container"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className={`stock-card ${changeColor}`}
                variants={hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
            >
                {/* Header */}
                <div className="stock-header">
                    <div>
                        <h3 className="stock-symbol">{stock.symbol}</h3>
                        <p className="stock-name">{stock.name}</p>
                    </div>
                    <span className="stock-icon">{changeIcon}</span>
                </div>

                {/* Price */}
                <div className="stock-price-section">
                    <div className="stock-price">
                        <span className="price-currency">$</span>
                        <span className="price-value">{displayPrice.toFixed(2)}</span>
                    </div>

                    <div className={`stock-change ${changeColor}`}>
                        <span className="change-value">
                            {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                        </span>
                        <span className="change-percent">
                            ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stock-stats-grid">
                    <div className="stat-item">
                        <div className="stat-label">Máximo</div>
                        <div className="stat-value">${stock.high.toFixed(2)}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Mínimo</div>
                        <div className="stat-value">${stock.low.toFixed(2)}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Volumen</div>
                        <div className="stat-value">{formatLargeNumber(stock.volume)}</div>
                    </div>
                </div>

                {/* Timestamp */}
                <div className="stock-timestamp">
                    🕐 Actualizado: {new Date(stock.timestamp).toLocaleTimeString()}
                </div>

                {/* Source Badge */}
                <div className="stock-source">
                    <span className="source-badge stock-source-badge">
                        📊 Alpha Vantage
                    </span>
                </div>

                {/* Price Chart */}
                {isLoadingHistory && (
                    <div className="stock-chart-loading">
                        <p>Loading chart...</p>
                    </div>
                )}
                {!isLoadingHistory && historyData && (
                    <StockChart data={historyData} symbol={stock.symbol} isPositive={isPositive} />
                )}
                {historyError && (
                    <div className="stock-chart-error">
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            Chart unavailable: {historyError}
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
