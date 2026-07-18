import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import type { ProgramExport } from '~~/types/program';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Program);

    const entries = await prisma.programEntry.findMany({
        orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });

    const payload: ProgramExport = {
        kind: 'kik-program',
        version: 1,
        exportedAt: new Date().toISOString(),
        entries: entries.map(entry => ({
            id: entry.id,
            title: entry.title,
            description: entry.description,
            startsAt: entry.startsAt.toISOString(),
            venue: entry.venue,
            language: entry.language,
            runtimeMinutes: entry.runtimeMinutes,
            ageRating: entry.ageRating,
            director: entry.director,
            country: entry.country,
            releaseYear: entry.releaseYear,
            infoUrl: entry.infoUrl,
            priceCents: entry.priceCents,
            isFree: entry.isFree,
            style: entry.style,
            highlightColor: entry.highlightColor,
            customBadgeText: entry.customBadgeText,
            customBadgeBorder: entry.customBadgeBorder,
            customBadgeIcon: entry.customBadgeIcon,
            customCardBorder: entry.customCardBorder,
            imagePath: entry.imagePath,
            imageAlt: entry.imageAlt,
            doesTheDogDieId: entry.doesTheDogDieId,
            status: entry.status,
            visibleFrom: entry.visibleFrom?.toISOString() ?? null,
            visibleUntil: entry.visibleUntil?.toISOString() ?? null,
        })),
    };

    return payload;
});
