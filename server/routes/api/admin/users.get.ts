import { requireAdmin } from '../../../utils/auth';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAdmin(event);

    return {
        users: await prisma.adminUser.findMany({
            select: { id: true, name: true, email: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
    };
});
