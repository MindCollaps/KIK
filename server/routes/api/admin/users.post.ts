import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin, hashPassword, requireAdmin } from '../../../utils/auth';
import { enforceRateLimit } from '../../../utils/rate-limit';
import { prisma } from '../../../utils/prisma';

const newUserSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
    password: z.string().min(12).max(128),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const currentUser = await requireAdmin(event);
    enforceRateLimit(`admin-create-user:${currentUser.id}`, 10);

    const parsed = newUserSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    try {
        const user = await prisma.adminUser.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                passwordHash,
            },
        });
        return { user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } };
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Diese E-Mail-Adresse wird bereits verwendet.' });
        }
        throw error;
    }
});
