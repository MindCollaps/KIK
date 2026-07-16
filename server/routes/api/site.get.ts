import { prisma } from '../../utils/prisma';
import { defaultFooter, defaultNavigation } from '../../utils/default-content';

export default defineEventHandler(async () => {
    const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ['navigation', 'footer'] } },
    });

    const byKey = new Map(settings.map(setting => [setting.key, setting.value]));

    return {
        navigation: byKey.get('navigation') ?? defaultNavigation,
        footer: byKey.get('footer') ?? defaultFooter,
    };
});
