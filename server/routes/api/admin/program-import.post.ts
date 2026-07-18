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

    const ids = new Set<string>();
    for (const entry of parsed.data.entries) {
        if (!entry.id) continue;
        if (ids.has(entry.id)) {
            throw createError({ statusCode: 400, statusMessage: `Die ID „${entry.id}“ kommt im Import doppelt vor.` });
        }
        ids.add(entry.id);
    }

    await prisma.$transaction(parsed.data.entries.map(({ id, ...entry }) => {
        const data = toProgramData(entry);
        return id
            ? prisma.programEntry.upsert({ where: { id }, create: { id, ...data }, update: data })
            : prisma.programEntry.create({ data });
    }));

    return { ok: true, importedEntries: parsed.data.entries.length };
});
