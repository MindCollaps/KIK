import type { Prisma } from '@prisma/client';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { firstIssueMessage, settingKeys, settingSchemas } from '../../../../utils/content';
import type { SettingKey } from '../../../../utils/content';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    await requireAuth(event, Permission.Settings);

    const key = getRouterParam(event, 'key') as SettingKey | undefined;
    if (!key || !settingKeys.includes(key)) {
        throw createError({ statusCode: 404, statusMessage: 'Unbekannte Einstellung.' });
    }

    const parsed = settingSchemas[key].safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: firstIssueMessage(parsed.error, 'Ungültige Einstellung.') });
    }

    const value = parsed.data as Prisma.InputJsonValue;
    const setting = await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
    });

    return { key, value: setting.value };
});
