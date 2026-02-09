import React from 'react';
import { getCurrencySymbol, getCurrencyFlag } from '@/lib/services/currencyService';
import type { CurrencyConversion } from '@/lib/services/currencyService';

interface CurrencyCardProps {
    conversion: CurrencyConversion;
}

export function CurrencyCard({ conversion }: CurrencyCardProps) {
    const fromSymbol = getCurrencySymbol(conversion.from);
    const toSymbol = getCurrencySymbol(conversion.to);
    const fromFlag = getCurrencyFlag(conversion.from);
    const toFlag = getCurrencyFlag(conversion.to);

    // Format numbers with commas
    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Reverse conversion
    const reverseRate = 1 / conversion.rate;
    const reverseAmount = conversion.amount / conversion.rate;

    return (
        <div className="currency-card-container">
            <div className="currency-card">
                {/* Main Conversion Result */}
                <div className="currency-main-result">
                    <div className="currency-from">
                        <span className="currency-flag">{fromFlag}</span>
                        <span className="currency-code">{conversion.from}</span>
                        <span className="currency-amount">{formatNumber(conversion.amount)}</span>
                    </div>

                    <div className="currency-equals">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>

                    <div className="currency-to">
                        <span className="currency-flag">{toFlag}</span>
                        <span className="currency-code">{conversion.to}</span>
                        <span className="currency-amount highlight">{formatNumber(conversion.result)}</span>
                    </div>
                </div>

                {/* Exchange Rate Info */}
                <div className="currency-rate-section">
                    <div className="rate-card">
                        <div className="rate-label">Tipo de cambio</div>
                        <div className="rate-value">
                            1 {conversion.from} = {conversion.rate.toFixed(4)} {conversion.to}
                        </div>
                    </div>

                    <div className="rate-card">
                        <div className="rate-label">Inverso</div>
                        <div className="rate-value">
                            1 {conversion.to} = {reverseRate.toFixed(4)} {conversion.from}
                        </div>
                    </div>
                </div>

                {/* Timestamp */}
                <div className="currency-timestamp">
                    <span className="timestamp-icon">🕐</span>
                    Actualizado: {new Date(conversion.timestamp).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                    })}
                </div>

                {/* Source Badge */}
                <div className="currency-source">
                    <span className="source-badge currency-source-badge">
                        💱 ExchangeRate-API
                    </span>
                </div>
            </div>
        </div>
    );
}
