import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Users);

    return {
        users: await prisma.adminUser.findMany({
            select: { id: true, name: true, email: true, permissions: true, active: true, lastLoginAt: true, emailConfirmedAt: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
    };
});
