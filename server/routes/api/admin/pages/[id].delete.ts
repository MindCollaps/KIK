import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Pages);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Seiten-ID.' });

    try {
        await prisma.page.delete({ where: { id } });
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Die Seite wurde nicht gefunden.' });
    }

    return { ok: true };
});
