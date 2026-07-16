import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const uploadDirectory = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export default defineEventHandler(async event => {
    const name = getRouterParam(event, 'name');
    if (!name || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(name)) {
        throw createError({ statusCode: 404, statusMessage: 'Bild nicht gefunden.' });
    }

    try {
        const data = await readFile(join(uploadDirectory, name));
        const extension = name.split('.').at(-1) ?? '';
        setHeader(event, 'Content-Type', contentTypes[extension] ?? 'application/octet-stream');
        setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
        return data;
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Bild nicht gefunden.' });
    }
});