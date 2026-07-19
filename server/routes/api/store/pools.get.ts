import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.KasseManage);

    const pools = await prisma.numberPool.findMany({
        include: { _count: { select: { items: true } } },
        orderBy: { name: 'asc' },
    });

    return {
        pools: pools.map(pool => ({
            id: pool.id,
            name: pool.name,
            nextNumber: pool.nextNumber,
            itemCount: pool._count.items,
        })),
    };
});
