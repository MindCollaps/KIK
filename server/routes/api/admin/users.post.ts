import { Prisma, AdminTokenType } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';
import { createAdminUserToken } from '../../../utils/tokens';
import { isMailingEnabled, resolveBaseUrl, sendTemplateMail, siteName } from '../../../utils/mail';

const inviteTtlMs = 48 * 60 * 60 * 1000;

const newUserSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
    permissions: z.array(z.enum(Permission)).default([]),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const currentUser = await requireAuth(event, Permission.Users);
    enforceRateLimit(`admin-create-user:${currentUser.id}`, 10);

    const parsed = newUserSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    let user;
    try {
        // Das Passwort legt die eingeladene Person selbst über den Bestätigungslink fest
        user = await prisma.adminUser.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                passwordHash: '',
                permissions: [...new Set(parsed.data.permissions)],
            },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Diese E-Mail-Adresse wird bereits verwendet.' });
        }
        throw error;
    }

    // Bei deaktiviertem Mailversand wird das Konto ohne Einladung angelegt;
    // das Passwort muss dann von der Verwaltung gesetzt werden.
    const inviteSent = isMailingEnabled();
    if (inviteSent) {
        try {
            const token = await createAdminUserToken(user.id, AdminTokenType.INVITE, inviteTtlMs);
            const actionUrl = `${resolveBaseUrl(event)}/admin?action=set-password&token=${token}`;

            await sendTemplateMail({
                to: user.email,
                subject: `Dein Konto bei ${siteName}`,
                template: 'invite',
                context: { name: user.name, actionUrl },
                text: `Hallo ${user.name},\n\nfür dich wurde ein Konto in der Programmverwaltung des ${siteName} angelegt. Bestätige dein Konto und lege dein Passwort fest:\n\n${actionUrl}\n\nDer Link ist 48 Stunden gültig.`,
            });
        }
        catch (error) {
            // Ohne Einladung ist das Konto nicht nutzbar – Anlage rückgängig machen
            await prisma.adminUser.delete({ where: { id: user.id } }).catch(() => undefined);
            throw error;
        }
    }

    return {
        user: { id: user.id, name: user.name, email: user.email, permissions: user.permissions, active: user.active, lastLoginAt: user.lastLoginAt, emailConfirmedAt: user.emailConfirmedAt, createdAt: user.createdAt },
        inviteSent,
    };
});
