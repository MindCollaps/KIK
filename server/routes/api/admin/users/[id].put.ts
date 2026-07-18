import { z } from 'zod';
import { assertSameOrigin, hashPassword, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';

const updateUserSchema = z.object({
    permissions: z.array(z.enum(Permission)).optional(),
    active: z.boolean().optional(),
    password: z.string().min(12).max(128).optional(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const currentUser = await requireAuth(event, Permission.Users);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Nutzer-ID.' });

    const parsed = updateUserSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) throw createError({ statusCode: 404, statusMessage: 'Der Nutzer wurde nicht gefunden.' });

    if (parsed.data.active === false && id === currentUser.id) {
        throw createError({ statusCode: 400, statusMessage: 'Du kannst dein eigenes Konto nicht deaktivieren.' });
    }

    const permissions = parsed.data.permissions ? [...new Set(parsed.data.permissions)] : undefined;

    // Es muss immer mindestens ein aktives Konto mit Nutzerverwaltung bestehen bleiben
    const wasManager = target.active && target.permissions.includes(Permission.Users);
    const staysManager = (parsed.data.active ?? target.active) && (permissions ?? target.permissions).includes(Permission.Users);
    if (wasManager && !staysManager) {
        const otherManagers = await prisma.adminUser.count({
            where: { id: { not: id }, active: true, permissions: { has: Permission.Users } },
        });
        if (otherManagers < 1) {
            throw createError({ statusCode: 400, statusMessage: 'Es muss mindestens ein aktives Konto mit Nutzerverwaltung bestehen bleiben.' });
        }
    }

    const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

    const [user] = await prisma.$transaction([
        prisma.adminUser.update({
            where: { id },
            data: {
                ...permissions ? { permissions } : {},
                ...parsed.data.active === undefined ? {} : { active: parsed.data.active },
                ...passwordHash
                    ? {
                        passwordHash,
                        // Ein von der Verwaltung gesetztes Passwort macht das Konto direkt nutzbar
                        emailConfirmedAt: target.emailConfirmedAt ?? new Date(),
                    }
                    : {},
            },
        }),
        // Bei neuem Passwort oder Deaktivierung: bestehende Sitzungen und offene Links beenden
        ...passwordHash || parsed.data.active === false
            ? [
                prisma.adminSession.deleteMany({ where: { userId: id } }),
                prisma.adminUserToken.deleteMany({ where: { userId: id } }),
            ]
            : [],
    ]);

    return { user: { id: user.id, name: user.name, email: user.email, permissions: user.permissions, active: user.active, lastLoginAt: user.lastLoginAt, emailConfirmedAt: user.emailConfirmedAt, createdAt: user.createdAt } };
});
