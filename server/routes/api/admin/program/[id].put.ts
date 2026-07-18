import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { getDoesTheDogDieSnapshot } from '../../../../utils/does-the-dog-die';
import { prisma } from '../../../../utils/prisma';
import { programEntrySchema, toProgramData } from '../../../../utils/program';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Program);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Programmeintrag fehlt.' });

    const parsed = programEntrySchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültiger Programmeintrag.' });
    }

    const existing = await prisma.programEntry.findUnique({ where: { id } });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Programmeintrag nicht gefunden.' });

    let snapshot = existing.contentWarnings;
    let snapshotUpdatedAt = existing.contentWarningsUpdatedAt;
    if (!parsed.data.doesTheDogDieId) {
        snapshot = null;
        snapshotUpdatedAt = null;
    }
    else if (parsed.data.doesTheDogDieId !== existing.doesTheDogDieId || !snapshot) {
        const refreshedSnapshot = await getDoesTheDogDieSnapshot(parsed.data.doesTheDogDieId);
        snapshot = refreshedSnapshot;
        snapshotUpdatedAt = new Date(refreshedSnapshot.fetchedAt);
    }

    return {
        entry: await prisma.programEntry.update({
            where: { id },
            data: {
                ...toProgramData(parsed.data),
                contentWarnings: snapshot ?? undefined,
                contentWarningsUpdatedAt: snapshotUpdatedAt,
            },
        }),
    };
});