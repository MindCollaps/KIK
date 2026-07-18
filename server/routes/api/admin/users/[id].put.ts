import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';

const updateUserSchema = z.object({
    permissions: z.array(z.enum(Permission)),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Users);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Nutzer-ID.' });

    const parsed = updateUserSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const permissions = [...new Set(parsed.data.permissions)];

    if (!permissions.includes(Permission.Users)) {
        const otherManagers = await prisma.adminUser.count({
            where: { id: { not: id }, permissions: { has: Permission.Users } },
        });
        if (otherManagers < 1) {
            throw createError({ statusCode: 400, statusMessage: 'Es muss mindestens ein Konto mit Nutzerverwaltung bestehen bleiben.' });
        }
    }

    try {
        const user = await prisma.adminUser.update({
            where: { id },
            data: { permissions },
        });
        return { user: { id: user.id, name: user.name, email: user.email, permissions: user.permissions, lastLoginAt: user.lastLoginAt, emailConfirmedAt: user.emailConfirmedAt, createdAt: user.createdAt } };
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Der Nutzer wurde nicht gefunden.' });
    }
});
