import { requireAdmin } from '../../../../utils/auth';
import { prisma } from '../../../../utils/prisma';
import { settingKeys } from '../../../../utils/content';
import type { SettingKey } from '../../../../utils/content';
import { defaultFooter, defaultNavigation } from '../../../../utils/default-content';

const defaults: Record<SettingKey, unknown> = {
    navigation: defaultNavigation,
    footer: defaultFooter,
};

export default defineEventHandler(async event => {
    await requireAdmin(event);

    const key = getRouterParam(event, 'key') as SettingKey | undefined;
    if (!key || !settingKeys.includes(key)) {
        throw createError({ statusCode: 404, statusMessage: 'Unbekannte Einstellung.' });
    }

    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return { key, value: setting?.value ?? defaults[key] };
});
