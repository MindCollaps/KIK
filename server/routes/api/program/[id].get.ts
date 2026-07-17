import { prisma } from '../../../utils/prisma';
import { programVisibilityWhere } from '../../../utils/program';

export default defineEventHandler(async event => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Programmeintrag fehlt.' });

    const now = new Date();
    const entry = await prisma.programEntry.findFirst({
        where: { id, ...programVisibilityWhere(now) },
    });

    if (!entry) throw createError({ statusCode: 404, statusMessage: 'Diese Vorstellung wurde nicht gefunden.' });
    return { entry };
});