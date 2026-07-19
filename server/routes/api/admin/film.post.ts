import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { getDoesTheDogDieSnapshot } from '../../../utils/does-the-dog-die';
import { filmSchema } from '../../../utils/film';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Films);

    const parsed = filmSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültiger Film.' });
    }

    const snapshot = parsed.data.doesTheDogDieId
        ? await getDoesTheDogDieSnapshot(parsed.data.doesTheDogDieId)
        : null;

    return {
        film: await prisma.film.create({
            data: {
                ...parsed.data,
                contentWarnings: snapshot ?? undefined,
                contentWarningsUpdatedAt: snapshot ? new Date(snapshot.fetchedAt) : null,
            },
        }),
    };
});
