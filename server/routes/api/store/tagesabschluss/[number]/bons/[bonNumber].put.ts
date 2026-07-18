import { assertSameOrigin, requireAuth } from '../../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../../../utils/prisma';
import { reportBonSchema, resolveReportBonLines } from '../../../../../../utils/report-bons';
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

    const parsed = reportBonSchema.safeParse(await readBody(event));
    if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });

    await prisma.$transaction(async tx => {
        const [abschluss, bon] = await Promise.all([
            tx.tagesabschluss.findUnique({ where: { number } }),
            tx.bon.findFirst({ where: { number: bonNumber, tagesabschlussId: number }, include: { items: true } }),
        ]);
        if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });
        if (!bon) throw createError({ statusCode: 404, statusMessage: 'Der Bon wurde nicht gefunden.' });
        if (parsed.data.createdAt < abschluss.periodStart || parsed.data.createdAt > abschluss.periodEnd) {
            throw createError({ statusCode: 400, statusMessage: 'Der Bon-Zeitpunkt muss innerhalb des Abschlusszeitraums liegen.' });
        }

        const lines = await resolveReportBonLines(tx, parsed.data, bonNumber);
        const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
        await tx.bon.update({
            where: { number: bonNumber },
            data: {
                paymentMethod: parsed.data.paymentMethod,
                createdAt: parsed.data.createdAt,
                totalCents,
                items: { deleteMany: {}, create: lines },
            },
        });
        await recalculateTagesabschluss(number, tx);
        await writeStoreLog('BON_UPDATED', user, {
            tagesabschluss: number,
            before: { paymentMethod: bon.paymentMethod, createdAt: bon.createdAt, totalCents: bon.totalCents, items: bon.items },
            after: { ...parsed.data, totalCents },
        }, bonNumber, tx);
    });

    const abschluss = await loadTagesabschluss(number);
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });
    return { abschluss: toAbschlussResponse(abschluss) };
});