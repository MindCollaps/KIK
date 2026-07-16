import { z } from 'zod';
import { assertSameOrigin, createAdminSession, verifyPassword } from '../../../utils/auth';
import { clearRateLimit, enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';

const loginSchema = z.object({
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
    password: z.string().min(1).max(128),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const rateLimitKey = `login:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`;
    enforceRateLimit(rateLimitKey);

    const parsed = loginSchema.safeParse(await readBody(event));
    if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Bitte prüfe E-Mail-Adresse und Passwort.' });

    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (!user || !await verifyPassword(parsed.data.password, user.passwordHash)) {
        throw createError({ statusCode: 401, statusMessage: 'E-Mail-Adresse oder Passwort ist falsch.' });
    }

    clearRateLimit(rateLimitKey);
    await createAdminSession(event, user.id);
    return { user: { id: user.id, name: user.name, email: user.email } };
});