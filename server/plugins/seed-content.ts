import type { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { defaultFooter, defaultNavigation, defaultPages } from '../utils/default-content';

export default defineNitroPlugin(async () => {
    try {
        const pageCount = await prisma.page.count();
        if (pageCount === 0) {
            await prisma.page.createMany({
                data: defaultPages.map(page => ({
                    ...page,
                    blocks: page.blocks as unknown as Prisma.InputJsonValue,
                })),
            });
        }

        const defaults: Array<{ key: string; value: Prisma.InputJsonValue }> = [
            { key: 'navigation', value: defaultNavigation as unknown as Prisma.InputJsonValue },
            { key: 'footer', value: defaultFooter as unknown as Prisma.InputJsonValue },
        ];

        for (const setting of defaults) {
            const existing = await prisma.siteSetting.findUnique({ where: { key: setting.key } });
            if (!existing) {
                await prisma.siteSetting.create({ data: setting });
            }
        }
    }
    catch (error) {
        console.error('Seeding der Seiteninhalte fehlgeschlagen:', error);
    }
});
