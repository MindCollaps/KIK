import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';
import { bonInclude, computePeriodStats, writeStoreLog } from '../../../utils/store';

const abschlussSchema = z.object({
    openingCashCents: z.number().int().min(0).max(100000000),
    countedCashCents: z.number().int().min(0).max(100000000),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseManage);

    const parsed = abschlussSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const abschluss = await prisma.$transaction(async transaction => {
        const [lastAbschluss, bons] = await Promise.all([
            transaction.tagesabschluss.findFirst({ orderBy: { number: 'desc' } }),
            transaction.bon.findMany({
                where: { tagesabschlussId: null },
                include: bonInclude,
                orderBy: { number: 'asc' },
            }),
        ]);

        const stats = computePeriodStats(bons);
        const now = new Date();
        const expectedCashCents = parsed.data.openingCashCents + stats.cashRevenueCents;

        const created = await transaction.tagesabschluss.create({
            data: {
                periodStart: lastAbschluss?.periodEnd ?? bons[0]?.createdAt ?? now,
                periodEnd: now,
                openingCashCents: parsed.data.openingCashCents,
                countedCashCents: parsed.data.countedCashCents,
                expectedCashCents,
                differenceCents: parsed.data.countedCashCents - expectedCashCents,
                revenueCents: stats.revenueCents,
                cashRevenueCents: stats.cashRevenueCents,
                cardRevenueCents: stats.cardRevenueCents,
                bonCount: stats.bonCount,
                stornoCount: stats.stornoCount,
                stornoTotalCents: stats.stornoTotalCents,
                breakdown: stats.breakdown as unknown as Prisma.InputJsonValue,
                createdById: user.id,
                createdByName: user.name,
            },
        });

        await transaction.bon.updateMany({
            where: { tagesabschlussId: null },
            data: { tagesabschlussId: created.number },
        });

        return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    await writeStoreLog('TAGESABSCHLUSS_CREATED', user, {
        number: abschluss.number,
        revenueCents: abschluss.revenueCents,
        differenceCents: abschluss.differenceCents,
        bonCount: abschluss.bonCount,
    });

    return { abschluss };
});
