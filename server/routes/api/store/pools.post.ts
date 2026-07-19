import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { writeStoreLog } from '../../../utils/store';

const poolSchema = z.object({
    name: z.string().trim().min(1).max(60),
    nextNumber: z.number().int().min(0).max(100000000).nullable().default(null),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const parsed = poolSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const pool = await prisma.numberPool.create({ data: parsed.data });
    await writeStoreLog('POOL_CREATED', user, { poolId: pool.id, name: pool.name, nextNumber: pool.nextNumber });

    return { pool };
});
