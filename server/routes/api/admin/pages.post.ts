import type { Prisma } from '@prisma/client';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { ensureUniqueBlockIds, firstIssueMessage, pageContentSchema } from '../../../utils/content';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Pages);

    const parsed = pageContentSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: firstIssueMessage(parsed.error, 'Ungültige Seite.') });
    }
    ensureUniqueBlockIds(parsed.data.blocks);

    const existing = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Unter diesem Pfad existiert bereits eine Seite.' });
    }

    return {
        page: await prisma.page.create({
            data: {
                ...parsed.data,
                blocks: parsed.data.blocks as unknown as Prisma.InputJsonValue,
            },
        }),
    };
});
