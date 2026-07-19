import { z } from 'zod';
import { prisma } from './prisma';

const optionalText = (max: number) => z.string().trim().max(max).nullable();

const filmBaseSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(4000),
    runtimeMinutes: z.number().int().min(1).max(600).nullable(),
    ageRating: optionalText(40),
    director: optionalText(160),
    country: optionalText(120),
    releaseYear: z.number().int().min(1888).max(2200).nullable(),
    infoUrl: z.string().url().max(1000).nullable(),
    imagePath: z.string().regex(/^\/media\/[a-zA-Z0-9._-]+$/).nullable(),
    imageAlt: optionalText(240),
    doesTheDogDieId: z.number().int().positive().nullable(),
});

export const filmSchema = filmBaseSchema;

export const filmExportSchema = filmBaseSchema.extend({ id: z.string().uuid().optional() });

// Ein Film darf nur gelöscht werden, wenn er von keiner Vorstellung mehr
// referenziert wird - das erzwingt bereits die FK-Restriktion in der DB,
// diese Prüfung liefert dafür eine verständliche Fehlermeldung vorab.
export async function assertFilmDeletable(filmId: string) {
    const entryCount = await prisma.programEntry.count({ where: { filmId } });
    if (entryCount > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Der Film ist noch mit Programmeinträgen verknüpft und kann nicht gelöscht werden.',
        });
    }
}

// Wie oft und wann ein Film bereits gezeigt wurde (Vorstellungen mit
// vergangenem Beginn), sortiert alphabetisch als stabile Grundordnung.
export async function listFilmsWithStats() {
    const now = new Date();
    const films = await prisma.film.findMany({
        include: {
            entries: {
                where: { startsAt: { lte: now } },
                select: { startsAt: true },
            },
        },
        orderBy: { title: 'asc' },
    });

    return films.map(({ entries, ...film }) => ({
        ...film,
        timesShown: entries.length,
        lastShownAt: entries.reduce<Date | null>(
            (latest, entry) => !latest || entry.startsAt > latest ? entry.startsAt : latest,
            null,
        ),
    }));
}
