import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Pages);

    return {
        pages: await prisma.page.findMany({ orderBy: { slug: 'asc' } }),
    };
});
