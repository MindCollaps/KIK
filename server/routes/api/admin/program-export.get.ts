import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import type { ProgramExport } from '~~/types/program';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Program);

    const [films, entries] = await Promise.all([
        prisma.film.findMany({ orderBy: { title: 'asc' } }),
        prisma.programEntry.findMany({
            orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
        }),
    ]);

    const payload: ProgramExport = {
        kind: 'kik-program',
        version: 2,
        exportedAt: new Date().toISOString(),
        films: films.map(film => ({
            id: film.id,
            title: film.title,
            description: film.description,
            runtimeMinutes: film.runtimeMinutes,
            ageRating: film.ageRating,
            director: film.director,
            country: film.country,
            releaseYear: film.releaseYear,
            infoUrl: film.infoUrl,
            imagePath: film.imagePath,
            imageAlt: film.imageAlt,
            doesTheDogDieId: film.doesTheDogDieId,
        })),
        entries: entries.map(entry => ({
            id: entry.id,
            filmId: entry.filmId,
            startsAt: entry.startsAt.toISOString(),
            venue: entry.venue,
            language: entry.language,
            priceCents: entry.priceCents,
            isFree: entry.isFree,
            style: entry.style,
            highlightColor: entry.highlightColor,
            customBadgeText: entry.customBadgeText,
            customBadgeBorder: entry.customBadgeBorder,
            customBadgeIcon: entry.customBadgeIcon,
            customCardBorder: entry.customCardBorder,
            status: entry.status,
            visibleFrom: entry.visibleFrom?.toISOString() ?? null,
            visibleUntil: entry.visibleUntil?.toISOString() ?? null,
        })),
    };

    return payload;
});
