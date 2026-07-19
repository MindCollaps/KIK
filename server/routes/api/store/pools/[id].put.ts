import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

const updateSchema = z.object({
    name: z.string().trim().min(1).max(60).optional(),
    nextNumber: z.number().int().min(0).max(100000000).nullable().optional(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Pool-ID.' });

    const parsed = updateSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    try {
        const pool = await prisma.numberPool.update({ where: { id }, data: parsed.data });
        await writeStoreLog('POOL_UPDATED', user, { poolId: pool.id, changes: parsed.data });
        return { pool };
    }
    catch {
        throw createError({ statusCode: 404, statusMessage: 'Der Nummernpool wurde nicht gefunden.' });
    }
});
