import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { getDoesTheDogDieSnapshot } from '../../../utils/does-the-dog-die';
import { prisma } from '../../../utils/prisma';
import { programEntrySchema, toProgramData } from '../../../utils/program';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Program);

    const parsed = programEntrySchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültiger Programmeintrag.' });
    }

    const snapshot = parsed.data.doesTheDogDieId
        ? await getDoesTheDogDieSnapshot(parsed.data.doesTheDogDieId)
        : null;

    return {
        entry: await prisma.programEntry.create({
            data: {
                ...toProgramData(parsed.data),
                contentWarnings: snapshot ?? undefined,
                contentWarningsUpdatedAt: snapshot ? new Date(snapshot.fetchedAt) : null,
            },
        }),
    };
});