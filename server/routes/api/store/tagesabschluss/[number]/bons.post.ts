import { assertSameOrigin, requireAuth } from '../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../../utils/prisma';
import { reportBonSchema, resolveReportBonLines } from '../../../../../utils/report-bons';
import { recalculateTagesabschluss, writeStoreLog } from '../../../../../utils/store';
import { loadTagesabschluss, toAbschlussResponse } from '../../../../../utils/store-export';

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseReportsEdit);
    const number = Number(getRouterParam(event, 'number'));
    if (!Number.isInteger(number) || number < 1) throw createError({ statusCode: 400, statusMessage: 'Ungültige Nummer.' });

    const parsed = reportBonSchema.safeParse(await readBody(event));
    if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });

    const bonNumber = await prisma.$transaction(async tx => {
        const abschluss = await tx.tagesabschluss.findUnique({ where: { number } });
        if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });
        if (parsed.data.createdAt < abschluss.periodStart || parsed.data.createdAt > abschluss.periodEnd) {
            throw createError({ statusCode: 400, statusMessage: 'Der Bon-Zeitpunkt muss innerhalb des Abschlusszeitraums liegen.' });
        }

        const lines = await resolveReportBonLines(tx, parsed.data);
        const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
        const bon = await tx.bon.create({
            data: {
                paymentMethod: parsed.data.paymentMethod,
                totalCents,
                createdAt: parsed.data.createdAt,
                createdById: user.id,
                createdByName: user.name,
                tagesabschlussId: number,
                items: { create: lines },
            },
        });
        await recalculateTagesabschluss(number, tx);
        await writeStoreLog('BON_CREATED', user, { manuallyAddedToTagesabschluss: number, ...parsed.data, totalCents }, bon.number, tx);
        return bon.number;
    });

    const abschluss = await loadTagesabschluss(number);
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });
    return { bonNumber, abschluss: toAbschlussResponse(abschluss) };
});