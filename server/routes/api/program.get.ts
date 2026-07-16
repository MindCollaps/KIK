import { prisma } from '../../utils/prisma';

export default defineEventHandler(async event => {
    const query = getQuery(event);
    const requestedLimit = Number(query.limit ?? 50);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const now = new Date();

    const entries = await prisma.programEntry.findMany({
        where: {
            startsAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
            OR: [
                { status: 'PUBLISHED' },
                {
                    status: 'SCHEDULED',
                    visibleFrom: { lte: now },
                    AND: [
                        { OR: [{ visibleUntil: null }, { visibleUntil: { gt: now } }] },
                    ],
                },
            ],
        },
        orderBy: { startsAt: 'asc' },
        take: limit,
    });

    return { entries };
});