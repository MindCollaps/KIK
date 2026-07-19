import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Pool-ID.' });

    const pool = await prisma.numberPool.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } },
    });
    if (!pool) throw createError({ statusCode: 404, statusMessage: 'Der Nummernpool wurde nicht gefunden.' });
    if (pool._count.items > 0) {
        throw createError({ statusCode: 400, statusMessage: 'Der Pool ist noch Artikeln zugeordnet. Bitte entferne zuerst die Zuordnungen.' });
    }

    await prisma.numberPool.delete({ where: { id } });
    await writeStoreLog('POOL_DELETED', user, { poolId: pool.id, name: pool.name });

    return { ok: true };
});
