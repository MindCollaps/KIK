import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Program);
    return {
        entries: await prisma.programEntry.findMany({
            include: { film: true },
            orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
        }),
    };
});
