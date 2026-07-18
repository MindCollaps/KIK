import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { writeStoreLog } from '../../../utils/store';

const categorySchema = z.object({
    name: z.string().trim().min(1).max(60),
    color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().default(null),
    icon: z.string().trim().min(1).max(120).nullable().default(null),
    sortOrder: z.number().int().min(0).max(9999).default(0),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const parsed = categorySchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const category = await prisma.storeCategory.create({ data: parsed.data });
    await writeStoreLog('CATEGORY_CREATED', user, { categoryId: category.id, name: category.name });

    return { category };
});
