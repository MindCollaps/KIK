import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { writeStoreLog } from '../../../utils/store';

const itemSchema = z.object({
    categoryId: z.string().uuid(),
    name: z.string().trim().min(1).max(80),
    priceCents: z.number().int().min(0).max(1000000).default(0),
    freePrice: z.boolean().default(false),
    color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().default(null),
    sortOrder: z.number().int().min(0).max(9999).default(0),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const parsed = itemSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const category = await prisma.storeCategory.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) throw createError({ statusCode: 404, statusMessage: 'Die Kategorie wurde nicht gefunden.' });

    const item = await prisma.storeItem.create({ data: parsed.data });
    await writeStoreLog('ITEM_CREATED', user, { itemId: item.id, name: item.name, priceCents: item.priceCents, freePrice: item.freePrice, categoryId: category.id });

    return { item };
});
