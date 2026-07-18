import { AdminTokenType } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin } from '../../../utils/auth';
import { enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';
import { createAdminUserToken } from '../../../utils/tokens';
import { resolveBaseUrl, sendTemplateMail, siteName } from '../../../utils/mail';

const resetTtlMs = 60 * 60 * 1000;

const requestSchema = z.object({
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    enforceRateLimit(`password-reset:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5);

    const parsed = requestSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Bitte prüfe die E-Mail-Adresse.' });
    }

    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });

    // Die Antwort ist immer identisch, damit keine Rückschlüsse auf
    // vorhandene Konten möglich sind – auch bei Versandfehlern.
    if (user) {
        try {
            const token = await createAdminUserToken(user.id, AdminTokenType.PASSWORD_RESET, resetTtlMs);
            const actionUrl = `${resolveBaseUrl(event)}/admin?action=set-password&token=${token}`;

            await sendTemplateMail({
                to: user.email,
                subject: `Passwort zurücksetzen bei ${siteName}`,
                template: 'password-reset',
                context: { name: user.name, actionUrl },
                text: `Hallo ${user.name},\n\nsetze dein Passwort für die Programmverwaltung des ${siteName} über diesen Link zurück:\n\n${actionUrl}\n\nDer Link ist 60 Minuten gültig. Wenn du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.`,
            });
        }
        catch (error) {
            console.error('[mail] Passwort-Zurücksetzen fehlgeschlagen:', error);
        }
    }

    return { ok: true };
});
