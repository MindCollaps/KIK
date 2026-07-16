import type { ContentWarningSnapshot, DoesTheDogDieSearchResult } from '../../types/program';
import { $fetch as ofetch } from 'ofetch';

const apiBaseUrl = 'https://www.doesthedogdie.com/api/v3';

interface DoesTheDogDieItem extends DoesTheDogDieSearchResult {
    topicItemStats?: Array<{
        topicId: number;
        topicName: string;
        yesSum: number;
        noSum: number;
        numComments: number;
    }>;
}

interface DoesTheDogDieError {
    status?: number;
    data?: {
        message?: string;
    };
}

function getApiKey() {
    const apiKey = process.env.DDD_API_KEY?.trim();
    if (!apiKey) {
        throw createError({
            statusCode: 503,
            statusMessage: 'DoesTheDogDie ist noch nicht konfiguriert. Bitte DDD_API_KEY setzen.',
        });
    }
    return apiKey;
}

async function requestDoesTheDogDie<T>(path: string): Promise<T> {
    try {
        return await ofetch<T>(`${apiBaseUrl}${path}`, {
            headers: { 'X-API-KEY': getApiKey() },
        });
    }
    catch (error: unknown) {
        const apiError = error as DoesTheDogDieError;
        if (apiError.status === 401) {
            throw createError({ statusCode: 502, statusMessage: 'Der DoesTheDogDie-API-Schlüssel ist ungültig.' });
        }
        if (apiError.status === 429) {
            throw createError({ statusCode: 503, statusMessage: 'Das DoesTheDogDie-Abfragelimit ist erreicht. Bitte später erneut versuchen.' });
        }
        if (apiError.status === 404) {
            throw createError({ statusCode: 404, statusMessage: 'Der Film wurde bei DoesTheDogDie nicht gefunden.' });
        }
        if (apiError.data?.message) {
            throw createError({ statusCode: 502, statusMessage: apiError.data.message });
        }
        throw error;
    }
}

export async function searchDoesTheDogDie(searchTerm: string): Promise<DoesTheDogDieSearchResult[]> {
    const query = new URLSearchParams({ q: searchTerm });
    const items: DoesTheDogDieItem[] = await requestDoesTheDogDie<DoesTheDogDieItem[]>(`/items?${query}`);
    return items
        .filter(item => item.itemTypeName.toLowerCase() === 'movie')
        .slice(0, 12)
        .map(item => ({
            id: item.id,
            name: item.name,
            releaseYear: item.releaseYear ?? null,
            itemTypeName: item.itemTypeName,
            posterImage: item.posterImage ?? null,
            overview: item.overview ?? null,
        }));
}

export async function getDoesTheDogDieSnapshot(itemId: number): Promise<ContentWarningSnapshot> {
    const item = await requestDoesTheDogDie<DoesTheDogDieItem>(`/items/${itemId}`);
    const stats = (item.topicItemStats ?? [])
        .filter(stat => stat.yesSum + stat.noSum > 0)
        .sort((left, right) => right.yesSum - left.yesSum)
        .map(stat => ({
            topicId: stat.topicId,
            topicName: stat.topicName,
            yesSum: stat.yesSum,
            noSum: stat.noSum,
            numComments: stat.numComments,
        }));

    return {
        itemId: item.id,
        name: item.name,
        releaseYear: item.releaseYear ?? null,
        overview: item.overview ?? null,
        posterImage: item.posterImage ?? null,
        fetchedAt: new Date().toISOString(),
        stats,
    };
}