import type { Prisma } from '@prisma/client';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { ensureUniqueBlockIds, firstIssueMessage, siteExportSchema } from '../../../utils/content';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Pages, Permission.Settings);

    const parsed = siteExportSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: firstIssueMessage(parsed.error, 'Ungültiger Website-Export.') });
    }

    const slugs = new Set<string>();
    for (const page of parsed.data.pages) {
        if (slugs.has(page.slug)) {
            throw createError({ statusCode: 400, statusMessage: `Der Pfad „${page.slug}“ kommt im Import doppelt vor.` });
        }
        slugs.add(page.slug);
        ensureUniqueBlockIds(page.blocks);
    }

    await prisma.$transaction([
        ...parsed.data.pages.map(page => prisma.page.upsert({
            where: { slug: page.slug },
            create: { ...page, blocks: page.blocks as unknown as Prisma.InputJsonValue },
            update: { ...page, blocks: page.blocks as unknown as Prisma.InputJsonValue },
        })),
        prisma.siteSetting.upsert({
            where: { key: 'navigation' },
            create: { key: 'navigation', value: parsed.data.navigation as unknown as Prisma.InputJsonValue },
            update: { value: parsed.data.navigation as unknown as Prisma.InputJsonValue },
        }),
        prisma.siteSetting.upsert({
            where: { key: 'footer' },
            create: { key: 'footer', value: parsed.data.footer as unknown as Prisma.InputJsonValue },
            update: { value: parsed.data.footer as unknown as Prisma.InputJsonValue },
        }),
    ]);

    return { ok: true, importedPages: parsed.data.pages.length };
});
