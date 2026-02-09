/**
 * Weather Service - OpenWeatherMap API Integration
 * Fetches current weather data for locations
 */

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    location: string;
    country: string;
    temperature: number;
    feelsLike: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    icon: string;
    timestamp: number;
}

export interface WeatherForecastData {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    description: string;
    icon: string;
    precipitation: number; // probability 0-100
}

/**
 * Fetch current weather for a city
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
    if (!WEATHER_API_KEY) {
        throw new Error('OpenWeatherMap API key not configured. Add VITE_OPENWEATHER_API_KEY to your .env file.');
    }

    const { retryWithBackoff, isRateLimitError } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        try {
            const response = await fetch(
                `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Location "${city}" not found`);
                }
                if (response.status === 401) {
                    throw new Error('Invalid API key');
                }
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                location: data.name,
                country: data.sys.country,
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                condition: data.weather[0].main,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                windDirection: data.wind.deg,
                icon: data.weather[0].icon,
                timestamp: Date.now()
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch weather data');
        }
    }, { maxRetries: 2, initialDelay: 500 });
}

/**
 * Fetch 5-day weather forecast
 */
export async function fetchWeatherForecast(city: string): Promise<WeatherForecastData[]> {
    if (!WEATHER_API_KEY) {
        throw new Error('OpenWeatherMap API key not configured');
    }

    const { retryWithBackoff } = await import('@/lib/retryUtil');

    return retryWithBackoff(async () => {
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
            if (response.status === 404) throw new Error(`Location "${city}" not found`);
            if (response.status === 401) throw new Error('Invalid API key');
            if (response.status === 429) throw new Error('Rate limit exceeded');
            throw new Error(`Forecast API error: ${response.status}`);
        }

        const data = await response.json();

        // Group forecasts by day (API returns 3-hour intervals)
        const dailyForecasts: Map<string, any[]> = new Map();

        data.list.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0]; // Get YYYY-MM-DD
            if (!dailyForecasts.has(date)) {
                dailyForecasts.set(date, []);
            }
            dailyForecasts.get(date)!.push(item);
        });

        // Get next 5 days
        const forecast: WeatherForecastData[] = [];
        let count = 0;

        for (const [date, items] of dailyForecasts) {
            if (count >= 5) break;

            const temps = items.map(i => i.main.temp);
            const conditions = items.map(i => i.weather[0].main);
            const icons = items.map(i => i.weather[0].icon);

            // Get most common condition
            const mainCondition = conditions.sort((a, b) =>
                conditions.filter(c => c === b).length - conditions.filter(c => c === a).length
            )[0];

            // Average precipitation probability
            const precipitation = Math.round(
                items.reduce((sum, i) => sum + (i.pop || 0), 0) / items.length * 100
            );

            const dateObj = new Date(date);
            forecast.push({
                date,
                dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                tempMax: Math.round(Math.max(...temps)),
                tempMin: Math.round(Math.min(...temps)),
                condition: mainCondition,
                description: items[0].weather[0].description,
                icon: icons[0],
                precipitation
            });

            count++;
        }

        return forecast;
    }, { maxRetries: 2, initialDelay: 500 });
}

/**
 * Extract city name from natural language query
 */
export function extractCityFromQuery(query: string): string | null {
    // Patterns: "weather in Paris", "clima en Madrid", "temperature in Tokyo"
    const patterns = [
        /(?:weather|clima|temperature|temperatura)\s+(?:in|en)\s+([a-záéíóúñ\s]+)/i,
        /(?:how'?s?\s+the\s+)?weather\s+(?:like\s+)?(?:in|at)\s+([a-záéíóúñ\s]+)/i,
        /(?:what'?s?\s+the\s+)?(?:weather|temperatura)\s+(?:in|en)\s+([a-záéíóúñ\s]+)/i
    ];

    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

/**
 * Get wind direction from degrees
 */
export function getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * Get weather emoji based on condition
 */
export function getWeatherEmoji(condition: string): string {
    const emojiMap: Record<string, string> = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };
    return emojiMap[condition] || '🌤️';
}
