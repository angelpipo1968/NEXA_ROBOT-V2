import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWeatherEmoji, getWindDirection, fetchWeatherForecast, WeatherForecastData } from '@/lib/services/weatherService';
import type { WeatherData } from '@/lib/services/weatherService';
import { WeatherForecast } from '@/components/weather/WeatherForecast';
import { cardVariants, hoverVariants, animateNumber } from '@/lib/animations';

interface WeatherCardProps {
    weather: WeatherData;
}

export function WeatherCard({ weather }: WeatherCardProps) {
    const emoji = getWeatherEmoji(weather.condition);
    const windDir = getWindDirection(weather.windDirection);

    const [forecastData, setForecastData] = useState<WeatherForecastData[] | null>(null);
    const [isLoadingForecast, setIsLoadingForecast] = useState(false);
    const [forecastError, setForecastError] = useState<string | null>(null);

    // Animated temperature state
    const [displayTemp, setDisplayTemp] = useState(weather.temperature);

    // Fetch forecast on mount
    useEffect(() => {
        async function loadForecast() {
            setIsLoadingForecast(true);
            setForecastError(null);
            try {
                const data = await fetchWeatherForecast(weather.location);
                setForecastData(data);
            } catch (error) {
                console.error('Failed to load forecast:', error);
                setForecastError(error instanceof Error ? error.message : 'Failed to load forecast');
            } finally {
                setIsLoadingForecast(false);
            }
        }
        loadForecast();
    }, [weather.location]);

    // Animate temperature on mount
    useEffect(() => {
        animateNumber(0, weather.temperature, 1000, (value) => {
            setDisplayTemp(Math.round(value));
        });
    }, [weather.temperature]);

    // Temperature-based gradient
    const getTempGradient = (temp: number) => {
        if (temp < 0) return 'from-blue-600/10 to-cyan-600/10';
        if (temp < 15) return 'from-blue-500/10 to-indigo-500/10';
        if (temp < 25) return 'from-green-500/10 to-emerald-500/10';
        if (temp < 32) return 'from-orange-500/10 to-amber-500/10';
        return 'from-red-500/10 to-orange-600/10';
    };

    return (
        <motion.div
            className="weather-card-container"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className={`weather-card bg-gradient-to-br ${getTempGradient(weather.temperature)}`}
                variants={hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
            >
                {/* Header */}
                <div className="weather-header">
                    <div>
                        <h3 className="weather-location">
                            📍 {weather.location}, {weather.country}
                        </h3>
                        <p className="weather-description">
                            {emoji} {weather.description}
                        </p>
                    </div>
                    <div className="weather-time">
                        {new Date(weather.timestamp).toLocaleTimeString()}
                    </div>
                </div>

                {/* Main Temperature */}
                <div className="weather-temp-main">
                    <span className="temperature-value">{displayTemp}</span>
                    <span className="temperature-unit">°C</span>
                </div>

                <p className="feels-like">
                    Sensación térmica: {weather.feelsLike}°C
                </p>

                {/* Weather Details Grid */}
                <div className="weather-details-grid">
                    <div className="weather-detail-item">
                        <span className="detail-icon">💧</span>
                        <div>
                            <div className="detail-label">Humedad</div>
                            <div className="detail-value">{weather.humidity}%</div>
                        </div>
                    </div>

                    <div className="weather-detail-item">
                        <span className="detail-icon">💨</span>
                        <div>
                            <div className="detail-label">Viento</div>
                            <div className="detail-value">{weather.windSpeed} km/h {windDir}</div>
                        </div>
                    </div>

                    <div className="weather-detail-item">
                        <span className="detail-icon">🌡️</span>
                        <div>
                            <div className="detail-label">Condición</div>
                            <div className="detail-value">{weather.condition}</div>
                        </div>
                    </div>
                </div>

                {/* Powered by badge */}
                <div className="weather-source">
                    <span className="source-badge weather-source-badge">
                        🌤️ OpenWeatherMap
                    </span>
                </div>

                {/* 5-Day Forecast */}
                {isLoadingForecast && (
                    <div className="forecast-loading">
                        <p>Loading forecast...</p>
                    </div>
                )}
                {!isLoadingForecast && forecastData && (
                    <WeatherForecast forecasts={forecastData} />
                )}
                {forecastError && (
                    <div className="forecast-error">
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '1rem' }}>
                            Forecast unavailable: {forecastError}
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
