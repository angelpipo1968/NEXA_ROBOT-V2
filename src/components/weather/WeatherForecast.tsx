import { WeatherForecastData } from '@/lib/services/weatherService';
import { getWeatherEmoji } from '@/lib/services/weatherService';
import './WeatherForecast.css';

interface WeatherForecastProps {
    forecasts: WeatherForecastData[];
}

export function WeatherForecast({ forecasts }: WeatherForecastProps) {
    if (!forecasts || forecasts.length === 0) {
        return (
            <div className="forecast-empty">
                <p>No forecast data available</p>
            </div>
        );
    }

    return (
        <div className="weather-forecast-container">
            <div className="forecast-header">
                <span className="forecast-title">📅 5-Day Forecast</span>
            </div>

            <div className="forecast-grid">
                {forecasts.map((day, index) => (
                    <div key={day.date} className="forecast-day-card">
                        {/* Day Name */}
                        <div className="forecast-day-name">
                            {index === 0 ? 'Today' : day.dayName}
                        </div>

                        {/* Weather Icon */}
                        <div className="forecast-icon">
                            {getWeatherEmoji(day.condition)}
                        </div>

                        {/* Temperature Range */}
                        <div className="forecast-temps">
                            <span className="temp-max">{day.tempMax}°</span>
                            <span className="temp-separator">/</span>
                            <span className="temp-min">{day.tempMin}°</span>
                        </div>

                        {/* Precipitation */}
                        {day.precipitation > 0 && (
                            <div className="forecast-precipitation">
                                💧 {day.precipitation}%
                            </div>
                        )}

                        {/* Condition */}
                        <div className="forecast-condition">
                            {day.condition}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
