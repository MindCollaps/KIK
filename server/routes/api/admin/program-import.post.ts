import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { firstIssueMessage } from '../../../utils/content';
import { programExportSchema, toProgramData } from '../../../utils/program';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Program);

    const parsed = programExportSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: firstIssueMessage(parsed.error, 'Ungültiger Programm-Export.') });
    }

    const filmIds = new Set<string>();
    for (const film of parsed.data.films) {
        if (!film.id) continue;
        if (filmIds.has(film.id)) {
            throw createError({ statusCode: 400, statusMessage: `Die Film-ID „${film.id}“ kommt im Import doppelt vor.` });
        }
        filmIds.add(film.id);
    }

    const entryIds = new Set<string>();
    for (const entry of parsed.data.entries) {
        if (!entry.id) continue;
        if (entryIds.has(entry.id)) {
            throw createError({ statusCode: 400, statusMessage: `Die ID „${entry.id}“ kommt im Import doppelt vor.` });
        }
        entryIds.add(entry.id);
    }

    const existingFilmIds = await prisma.film.findMany({ select: { id: true } });
    const knownFilmIds = new Set([...filmIds, ...existingFilmIds.map(film => film.id)]);
    for (const entry of parsed.data.entries) {
        if (!knownFilmIds.has(entry.filmId)) {
            throw createError({ statusCode: 400, statusMessage: `Der Film mit der ID „${entry.filmId}“ wurde im Import nicht gefunden.` });
        }
    }

    await prisma.$transaction([
        ...parsed.data.films.map(({ id, ...film }) => id
            ? prisma.film.upsert({ where: { id }, create: { id, ...film }, update: film })
            : prisma.film.create({ data: film })),
        ...parsed.data.entries.map(({ id, ...entry }) => {
            const data = toProgramData(entry);
            return id
                ? prisma.programEntry.upsert({ where: { id }, create: { id, ...data }, update: data })
                : prisma.programEntry.create({ data });
        }),
    ]);

    return { ok: true, importedFilms: parsed.data.films.length, importedEntries: parsed.data.entries.length };
});
