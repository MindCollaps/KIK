interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

export function enforceRateLimit(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const existing = attempts.get(key);

    if (!existing || existing.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }

    existing.count += 1;
    if (existing.count > limit) {
        throw createError({
            statusCode: 429,
            statusMessage: 'Zu viele Versuche. Bitte warte einige Minuten.',
        });
    }
}

export function clearRateLimit(key: string) {
    attempts.delete(key);
}