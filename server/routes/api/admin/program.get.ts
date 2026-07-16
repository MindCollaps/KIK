import { requireAdmin } from '../../../utils/auth';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAdmin(event);
    return {
        entries: await prisma.programEntry.findMany({
            orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
        }),
    };
});