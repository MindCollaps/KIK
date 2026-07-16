import { requireAdmin } from '../../../utils/auth';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAdmin(event);

    return {
        pages: await prisma.page.findMany({ orderBy: { slug: 'asc' } }),
    };
});
