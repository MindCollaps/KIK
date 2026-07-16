import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { z } from 'zod';
import { assertSameOrigin, requireAdmin } from '../../../utils/auth';

const maxUploadSize = 8 * 1024 * 1024;
const uploadDirectory = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

const bodySchema = z.object({
    url: z.string().url(),
});

function detectExtension(data: Buffer) {
    if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return '.jpg';
    if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
    if (data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') return '.webp';
    return null;
}

function ensureAllowedUrl(rawUrl: string) {
    const parsed = new URL(rawUrl);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
        throw createError({ statusCode: 400, statusMessage: 'Nur HTTP(S)-Bildquellen sind erlaubt.' });
    }

    const blockedHosts = new Set(['localhost', '127.0.0.1', '::1']);
    if (blockedHosts.has(parsed.hostname.toLowerCase())) {
        throw createError({ statusCode: 400, statusMessage: 'Diese Bildquelle ist nicht erlaubt.' });
    }

    return parsed.toString();
}

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAdmin(event);

    const parsedBody = bodySchema.safeParse(await readBody(event));
    if (!parsedBody.success) {
        throw createError({ statusCode: 400, statusMessage: 'Ungueltige Bildquelle.' });
    }

    const sourceUrl = ensureAllowedUrl(parsedBody.data.url);

    const response = await fetch(sourceUrl, { redirect: 'follow' });
    if (!response.ok) {
        throw createError({ statusCode: 502, statusMessage: 'Das Bild konnte nicht geladen werden.' });
    }

    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader && Number(contentLengthHeader) > maxUploadSize) {
        throw createError({ statusCode: 413, statusMessage: 'Das Bild darf hoechstens 8 MB gross sein.' });
    }

    const data = Buffer.from(await response.arrayBuffer());
    if (data.byteLength > maxUploadSize) {
        throw createError({ statusCode: 413, statusMessage: 'Das Bild darf hoechstens 8 MB gross sein.' });
    }

    const extension = detectExtension(data);
    if (!extension) {
        throw createError({ statusCode: 415, statusMessage: 'Erlaubt sind JPEG, PNG und WebP.' });
    }

    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(uploadDirectory, filename), data, { flag: 'wx' });

    return { path: `/media/${filename}` };
});
