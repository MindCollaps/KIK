import { createHash, randomBytes } from 'node:crypto';
import type { AdminTokenType } from '@prisma/client';
import { prisma } from './prisma';

function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function createAdminUserToken(userId: string, type: AdminTokenType, ttlMs: number) {
    const token = randomBytes(32).toString('base64url');

    await prisma.$transaction([
        // Pro Nutzer und Zweck ist immer nur der neueste Link gültig
        prisma.adminUserToken.deleteMany({ where: { userId, type } }),
        prisma.adminUserToken.create({
            data: {
                tokenHash: hashToken(token),
                type,
                expiresAt: new Date(Date.now() + ttlMs),
                userId,
            },
        }),
    ]);

    return token;
}

export async function consumeAdminUserToken(token: string) {
    const record = await prisma.adminUserToken.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { user: true },
    });

    if (!record) return null;
    if (record.expiresAt <= new Date()) {
        await prisma.adminUserToken.delete({ where: { id: record.id } });
        return null;
    }

    return record;
}
