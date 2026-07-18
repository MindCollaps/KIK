import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const currentUser = await requireAuth(event, Permission.Users);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Nutzer-ID.' });

    if (id === currentUser.id) {
        throw createError({ statusCode: 400, statusMessage: 'Du kannst dein eigenes Konto nicht löschen.' });
    }

    const remainingManagers = await prisma.adminUser.count({
        where: { id: { not: id }, active: true, permissions: { has: Permission.Users } },
    });
    if (remainingManagers < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Es muss mindestens ein aktives Konto mit Nutzerverwaltung bestehen bleiben.' });
    }

    try {
        await prisma.adminUser.delete({ where: { id } });
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Der Nutzer wurde nicht gefunden.' });
    }

    return { ok: true };
});
