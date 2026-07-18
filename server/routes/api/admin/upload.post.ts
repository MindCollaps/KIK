import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { assertSameOrigin, requireAuthAny } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';

const maxUploadSize = 8 * 1024 * 1024;
const uploadDirectory = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

function detectExtension(data: Buffer) {
    if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return '.jpg';
    if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
    if (data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') return '.webp';
    return null;
}

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuthAny(event, Permission.Pages, Permission.Program, Permission.Settings);

    const parts = await readMultipartFormData(event);
    const file = parts?.find(part => part.name === 'image' && part.filename);
    if (!file?.data) throw createError({ statusCode: 400, statusMessage: 'Bitte wähle ein Bild aus.' });
    if (file.data.byteLength > maxUploadSize) throw createError({ statusCode: 413, statusMessage: 'Das Bild darf höchstens 8 MB groß sein.' });

    const extension = detectExtension(file.data);
    if (!extension) throw createError({ statusCode: 415, statusMessage: 'Erlaubt sind JPEG, PNG und WebP.' });

    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(uploadDirectory, filename), file.data, { flag: 'wx' });

    return { path: `/media/${filename}`, originalExtension: extname(file.filename ?? '') };
});