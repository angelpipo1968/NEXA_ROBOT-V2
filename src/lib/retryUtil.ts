/**
 * Retry utility with exponential backoff
 */

export interface RetryConfig {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}

export class RetryError extends Error {
    constructor(
        message: string,
        public readonly attempts: number,
        public readonly lastError: Error
    ) {
        super(message);
        this.name = 'RetryError';
    }
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: RetryConfig = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2
    } = config;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on certain errors
            if (
                error instanceof Error &&
                (error.message.includes('API key not configured') ||
                    error.message.includes('Invalid API key') ||
                    error.message.includes('401') ||
                    error.message.includes('403'))
            ) {
                throw error;
            }

            // If this was the last attempt, throw
            if (attempt === maxRetries) {
                throw new RetryError(
                    `Failed after ${attempt + 1} attempts`,
                    attempt + 1,
                    lastError
                );
            }

            // Wait before retrying
            console.log(
                `[RETRY] Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${delay}ms...`,
                error
            );

            await sleep(delay);

            // Increase delay for next attempt (exponential backoff)
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError!;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
    if (error?.response?.status === 429) return true;
    if (error?.status === 429) return true;
    if (error?.message?.toLowerCase().includes('rate limit')) return true;
    if (error?.message?.toLowerCase().includes('too many requests')) return true;
    return false;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
    if (error?.code === 'ECONNREFUSED') return true;
    if (error?.code === 'ENOTFOUND') return true;
    if (error?.code === 'ETIMEDOUT') return true;
    if (error?.message?.toLowerCase().includes('network')) return true;
    if (error?.message?.toLowerCase().includes('fetch failed')) return true;
    return false;
}
