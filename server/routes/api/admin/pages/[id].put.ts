import type { Prisma } from '@prisma/client';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { ensureUniqueBlockIds, firstIssueMessage, pageContentSchema } from '../../../../utils/content';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Pages);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Seiten-ID.' });

    const parsed = pageContentSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: firstIssueMessage(parsed.error, 'Ungültige Seite.') });
    }
    ensureUniqueBlockIds(parsed.data.blocks);

    const conflict = await prisma.page.findFirst({
        where: { slug: parsed.data.slug, id: { not: id } },
    });
    if (conflict) {
        throw createError({ statusCode: 409, statusMessage: 'Unter diesem Pfad existiert bereits eine andere Seite.' });
    }

    try {
        return {
            page: await prisma.page.update({
                where: { id },
                data: {
                    ...parsed.data,
                    blocks: parsed.data.blocks as unknown as Prisma.InputJsonValue,
                },
            }),
        };
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Die Seite wurde nicht gefunden.' });
    }
});
