import { assertSameOrigin, requireAdmin } from '../../../../utils/auth';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const currentUser = await requireAdmin(event);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Nutzer-ID.' });

    if (id === currentUser.id) {
        throw createError({ statusCode: 400, statusMessage: 'Du kannst dein eigenes Konto nicht löschen.' });
    }

    const totalUsers = await prisma.adminUser.count();
    if (totalUsers <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Es muss mindestens ein Administrationskonto bestehen bleiben.' });
    }

    try {
        await prisma.adminUser.delete({ where: { id } });
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Der Nutzer wurde nicht gefunden.' });
    }

    return { ok: true };
});
