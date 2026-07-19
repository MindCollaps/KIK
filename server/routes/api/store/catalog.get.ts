import { requireAuthAny } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    const user = await requireAuthAny(event, Permission.KasseUse, Permission.KasseReportsEdit, Permission.KasseManage);

    const includeArchived = getQuery(event).all === 'true' && user.permissions.includes(Permission.KasseManage);

    const categories = await prisma.storeCategory.findMany({
        where: includeArchived ? {} : { archived: false },
        include: {
            items: {
                where: includeArchived ? {} : { archived: false },
                include: { numberPool: { select: { id: true, name: true, nextNumber: true } } },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return { categories };
});
