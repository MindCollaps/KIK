import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

const updateSchema = z.object({
    name: z.string().trim().min(1).max(80).optional(),
    priceCents: z.number().int().min(0).max(1000000).optional(),
    freePrice: z.boolean().optional(),
    color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    archived: z.boolean().optional(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Artikel-ID.' });

    const parsed = updateSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    try {
        const item = await prisma.storeItem.update({ where: { id }, data: parsed.data });
        await writeStoreLog('ITEM_UPDATED', user, { itemId: item.id, changes: parsed.data });
        return { item };
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Der Artikel wurde nicht gefunden.' });
    }
});
