import { assertSameOrigin, requireAuth } from '../../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../../../utils/prisma';
import { recalculateTagesabschluss, writeStoreLog } from '../../../../../../utils/store';
import { loadTagesabschluss, toAbschlussResponse } from '../../../../../../utils/store-export';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseReportsEdit);
    const number = Number(getRouterParam(event, 'number'));
    const bonNumber = Number(getRouterParam(event, 'bonNumber'));
    if (!Number.isInteger(number) || number < 1 || !Number.isInteger(bonNumber) || bonNumber < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Nummer.' });
    }

    await prisma.$transaction(async tx => {
        const bon = await tx.bon.findFirst({ where: { number: bonNumber, tagesabschlussId: number }, include: { items: true } });
        if (!bon) throw createError({ statusCode: 404, statusMessage: 'Der Bon wurde nicht gefunden.' });

        await tx.bon.delete({ where: { number: bonNumber } });
        await recalculateTagesabschluss(number, tx);
        await writeStoreLog('BON_DELETED', user, { tagesabschluss: number, bon }, bonNumber, tx);
    });

    const abschluss = await loadTagesabschluss(number);
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });
    return { abschluss: toAbschlussResponse(abschluss) };
});