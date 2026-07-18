import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { writeStoreLog } from '../../../utils/store';

const reorderSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(200),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const parsed = reorderSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Reihenfolge.' });
    }

    await prisma.$transaction(parsed.data.ids.map((id, index) => prisma.storeCategory.update({
        where: { id },
        data: { sortOrder: index },
    }))).catch(() => {
        throw createError({ statusCode: 400, statusMessage: 'Die Reihenfolge konnte nicht gespeichert werden.' });
    });

    await writeStoreLog('CATEGORY_UPDATED', user, { reordered: parsed.data.ids });

    return { ok: true };
});
