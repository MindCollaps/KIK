import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { assertFilmDeletable } from '../../../../utils/film';
import { prisma } from '../../../../utils/prisma';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Films);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Film fehlt.' });

    await assertFilmDeletable(id);

    await prisma.film.delete({ where: { id } });
    return { ok: true };
});
