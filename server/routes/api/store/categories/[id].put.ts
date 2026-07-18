import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

const updateSchema = z.object({
    name: z.string().trim().min(1).max(60).optional(),
    color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().optional(),
    icon: z.string().trim().min(1).max(120).nullable().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    archived: z.boolean().optional(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Kategorie-ID.' });

    const parsed = updateSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    try {
        const category = await prisma.storeCategory.update({ where: { id }, data: parsed.data });
        await writeStoreLog('CATEGORY_UPDATED', user, { categoryId: category.id, changes: parsed.data });
        return { category };
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Die Kategorie wurde nicht gefunden.' });
    }
});
