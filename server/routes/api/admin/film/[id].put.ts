import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { getDoesTheDogDieSnapshot } from '../../../../utils/does-the-dog-die';
import { filmSchema } from '../../../../utils/film';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Films);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Film fehlt.' });

    const parsed = filmSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültiger Film.' });
    }

    const existing = await prisma.film.findUnique({ where: { id } });
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Film nicht gefunden.' });

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
        film: await prisma.film.update({
            where: { id },
            data: {
                ...parsed.data,
                contentWarnings: snapshot ?? undefined,
                contentWarningsUpdatedAt: snapshotUpdatedAt,
            },
        }),
    };
});
