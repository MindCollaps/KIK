import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { H3Event } from 'h3';
import { prisma } from './prisma';

const scrypt = promisify(scryptCallback);
const sessionCookie = 'kik_admin_session';
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

export function assertSameOrigin(event: H3Event) {
    const origin = getHeader(event, 'origin');
    if (!origin) return;

    const host = getHeader(event, 'x-forwarded-host') ?? getHeader(event, 'host');
    const protocol = getHeader(event, 'x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    if (!host || origin !== `${protocol}://${host}`) {
        throw createError({ statusCode: 403, statusMessage: 'Ungültige Anfragequelle.' });
    }
}

export async function hashPassword(password: string) {
    const salt = randomBytes(16);
    const derived = await scrypt(password, salt, 64) as Buffer;
    return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
    const [algorithm, saltHex, hashHex] = stored.split(':');
    if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashSessionToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(event: H3Event, userId: string) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + sessionDurationMs);

    await prisma.adminSession.create({
        data: {
            tokenHash: hashSessionToken(token),
            expiresAt,
            userId,
        },
    });

    setCookie(event, sessionCookie, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: Math.floor(sessionDurationMs / 1000),
    });
}

export async function getAdminUser(event: H3Event) {
    const token = getCookie(event, sessionCookie);
    if (!token) return null;

    const session = await prisma.adminSession.findUnique({
        where: { tokenHash: hashSessionToken(token) },
        include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
        if (session) await prisma.adminSession.delete({ where: { id: session.id } });
        deleteCookie(event, sessionCookie, { path: '/' });
        return null;
    }

    return session.user;
}

export async function requireAdmin(event: H3Event) {
    const user = await getAdminUser(event);
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Bitte melde dich an.' });
    return user;
}

export async function destroyAdminSession(event: H3Event) {
    const token = getCookie(event, sessionCookie);
    if (token) {
        await prisma.adminSession.deleteMany({
            where: { tokenHash: hashSessionToken(token) },
        });
    }
    deleteCookie(event, sessionCookie, { path: '/' });
}