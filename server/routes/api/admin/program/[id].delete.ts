import { assertSameOrigin, requireAdmin } from '../../../../utils/auth';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAdmin(event);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Programmeintrag fehlt.' });

    await prisma.programEntry.delete({ where: { id } });
    return { ok: true };
});