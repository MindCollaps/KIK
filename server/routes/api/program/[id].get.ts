import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Programmeintrag fehlt.' });

    const now = new Date();
    const entry = await prisma.programEntry.findFirst({
        where: {
            id,
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
    });

    if (!entry) throw createError({ statusCode: 404, statusMessage: 'Diese Vorstellung wurde nicht gefunden.' });
    return { entry };
});