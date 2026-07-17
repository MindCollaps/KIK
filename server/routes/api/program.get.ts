import { prisma } from '../../utils/prisma';
import { programVisibilityWhere } from '../../utils/program';

export default defineEventHandler(async event => {
    const query = getQuery(event);
    const requestedLimit = Number(query.limit ?? 50);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const now = new Date();

    const entries = await prisma.programEntry.findMany({
        where: programVisibilityWhere(now),
        orderBy: { startsAt: 'asc' },
        take: limit,
    });

    return { entries };
});