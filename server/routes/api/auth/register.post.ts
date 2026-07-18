import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin, createAdminSession, hashPassword, toPublicUser } from '../../../utils/auth';
import { allPermissions } from '~~/types/permissions';
import { enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';

const registrationSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
    password: z.string().min(12).max(128),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    enforceRateLimit(`register:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5);

    const parsed = registrationSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    try {
        const user = await prisma.$transaction(async transaction => {
            await transaction.setupState.create({ data: { key: 'admin_initialized' } });
            return transaction.adminUser.create({
                data: {
                    name: parsed.data.name,
                    email: parsed.data.email,
                    passwordHash,
                    // Das erste Konto richtet die Administration ein und erhält alle Berechtigungen
                    permissions: [...allPermissions],
                    // Ohne Mail-Infrastruktur beim Setup gilt das Konto als bestätigt
                    emailConfirmedAt: new Date(),
                },
            });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        await createAdminSession(event, user.id);
        return { user: toPublicUser(user) };
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Die Administration wurde bereits eingerichtet.' });
        }
        throw error;
    }
});