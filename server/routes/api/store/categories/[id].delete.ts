import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Kategorie-ID.' });

    const category = await prisma.storeCategory.findUnique({
        where: { id },
        include: { _count: { select: { items: true } } },
    });
    if (!category) throw createError({ statusCode: 404, statusMessage: 'Die Kategorie wurde nicht gefunden.' });
    if (!category.archived) throw createError({ statusCode: 409, statusMessage: 'Die Kategorie muss zuerst archiviert werden.' });
    if (category._count.items > 0) throw createError({ statusCode: 409, statusMessage: 'Lösche zuerst alle Artikel dieser Kategorie.' });

    await prisma.storeCategory.delete({ where: { id } });
    await writeStoreLog('CATEGORY_DELETED', user, { categoryId: category.id, name: category.name });
    return { success: true };
});