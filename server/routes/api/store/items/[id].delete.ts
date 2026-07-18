import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { writeStoreLog } from '../../../../utils/store';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Artikel-ID.' });

    const item = await prisma.storeItem.findUnique({ where: { id } });
    if (!item) throw createError({ statusCode: 404, statusMessage: 'Der Artikel wurde nicht gefunden.' });
    if (!item.archived) throw createError({ statusCode: 409, statusMessage: 'Der Artikel muss zuerst archiviert werden.' });

    await prisma.storeItem.delete({ where: { id } });
    await writeStoreLog('ITEM_DELETED', user, { itemId: item.id, categoryId: item.categoryId, name: item.name });
    return { success: true };
});