import { z } from 'zod';
import { assertSameOrigin, createAdminSession, hashPassword, toPublicUser } from '../../../utils/auth';
import { enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';
import { consumeAdminUserToken } from '../../../utils/tokens';

const setPasswordSchema = z.object({
    token: z.string().min(10).max(200),
    password: z.string().min(12).max(128),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    enforceRateLimit(`set-password:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 10);

    const parsed = setPasswordSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const record = await consumeAdminUserToken(parsed.data.token);
    if (!record) {
        throw createError({ statusCode: 400, statusMessage: 'Der Link ist ungültig oder abgelaufen. Fordere über „Passwort vergessen“ einen neuen an.' });
    }

    if (!record.user.active) {
        throw createError({ statusCode: 403, statusMessage: 'Dein Konto wurde deaktiviert.' });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const [user] = await prisma.$transaction([
        prisma.adminUser.update({
            where: { id: record.userId },
            data: {
                passwordHash,
                // Wer den Link aus der E-Mail nutzt, hat damit die Adresse bestätigt
                emailConfirmedAt: record.user.emailConfirmedAt ?? new Date(),
            },
        }),
        prisma.adminUserToken.deleteMany({ where: { userId: record.userId } }),
        // Bestehende Sitzungen werden aus Sicherheitsgründen beendet
        prisma.adminSession.deleteMany({ where: { userId: record.userId } }),
    ]);

    await createAdminSession(event, user.id);
    return { user: toPublicUser(user) };
});
