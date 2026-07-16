import { requireAdmin } from '../../../utils/auth';
import { prisma } from '../../../utils/prisma';
import { defaultFooter, defaultNavigation } from '../../../utils/default-content';
import type { PageContent, SiteExport } from '~~/types/content';

export default defineEventHandler(async event => {
    await requireAdmin(event);

    const [pages, settings] = await Promise.all([
        prisma.page.findMany({ orderBy: { slug: 'asc' } }),
        prisma.siteSetting.findMany({ where: { key: { in: ['navigation', 'footer'] } } }),
    ]);

    const byKey = new Map(settings.map(setting => [setting.key, setting.value]));

    const payload: SiteExport = {
        kind: 'kik-site',
        version: 1,
        exportedAt: new Date().toISOString(),
        navigation: (byKey.get('navigation') ?? defaultNavigation) as SiteExport['navigation'],
        footer: (byKey.get('footer') ?? defaultFooter) as SiteExport['footer'],
        pages: pages.map(page => ({
            slug: page.slug,
            title: page.title,
            description: page.description,
            theme: page.theme,
            status: page.status,
            blocks: page.blocks,
        }) as PageContent),
    };

    return payload;
});
