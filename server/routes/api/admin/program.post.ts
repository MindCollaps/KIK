import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { programEntrySchema, toProgramData } from '../../../utils/program';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Program);

    const parsed = programEntrySchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültiger Programmeintrag.' });
    }

    const film = await prisma.film.findUnique({ where: { id: parsed.data.filmId } });
    if (!film) throw createError({ statusCode: 404, statusMessage: 'Der ausgewählte Film wurde nicht gefunden.' });

    return {
        entry: await prisma.programEntry.create({
            data: toProgramData(parsed.data),
            include: { film: true },
        }),
    };
});
