import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import type { NumberedBreakdownEntry } from '~~/types/store';
import { prisma } from '../../../utils/prisma';
import { bonInclude, computeNumberedStats, computePeriodStats, writeStoreLog } from '../../../utils/store';

const abschlussSchema = z.object({
    openingCashCents: z.number().int().min(0).max(100000000),
    countedCashCents: z.number().int().min(0).max(100000000),
    cashDifferenceReason: z.string().trim().max(300).optional(),
    numberedPools: z.array(z.object({
        poolId: z.string().uuid(),
        countedLastNumber: z.number().int().min(0).max(100000000),
        reason: z.string().trim().max(300).optional(),
    })).max(200).default([]),
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
        const numberedStats = computeNumberedStats(bons);
        const now = new Date();
        const expectedCashCents = parsed.data.openingCashCents + stats.cashRevenueCents;
        const differenceCents = parsed.data.countedCashCents - expectedCashCents;

        const cashDifferenceReason = parsed.data.cashDifferenceReason || null;
        if (differenceCents < 0 && (!cashDifferenceReason || cashDifferenceReason.length < 3)) {
            throw createError({ statusCode: 400, statusMessage: 'Die Kasse ist im Minus. Bitte gib einen Grund für die Differenz an.' });
        }

        const submittedByPool = new Map(parsed.data.numberedPools.map(entry => [entry.poolId, entry]));
        const numberedBreakdown: NumberedBreakdownEntry[] = [];

        for (const stat of numberedStats) {
            const submitted = submittedByPool.get(stat.poolId);
            if (!submitted) {
                throw createError({ statusCode: 400, statusMessage: `Bitte gib für „${stat.name}“ die letzte verkaufte Nummer an.` });
            }

            const reason = submitted.reason || null;
            const matches = submitted.countedLastNumber === stat.lastNumber;
            if (!matches && (!reason || reason.length < 3)) {
                throw createError({ statusCode: 400, statusMessage: `Die letzte Nummer für „${stat.name}“ weicht ab. Bitte gib einen Grund an.` });
            }

            if (!matches) {
                // Zählerstand korrigieren, damit die nächste Periode mit der
                // tatsächlich nächsten physischen Nummer weiterzählt
                await transaction.numberPool.updateMany({
                    where: { id: stat.poolId },
                    data: { nextNumber: submitted.countedLastNumber + 1 },
                });
            }

            numberedBreakdown.push({
                ...stat,
                countedLastNumber: submitted.countedLastNumber,
                reason,
            });
        }

        const created = await transaction.tagesabschluss.create({
            data: {
                periodStart: lastAbschluss?.periodEnd ?? bons[0]?.createdAt ?? now,
                periodEnd: now,
                openingCashCents: parsed.data.openingCashCents,
                countedCashCents: parsed.data.countedCashCents,
                expectedCashCents,
                differenceCents,
                cashDifferenceReason,
                revenueCents: stats.revenueCents,
                cashRevenueCents: stats.cashRevenueCents,
                cardRevenueCents: stats.cardRevenueCents,
                bonCount: stats.bonCount,
                stornoCount: stats.stornoCount,
                stornoTotalCents: stats.stornoTotalCents,
                breakdown: stats.breakdown as unknown as Prisma.InputJsonValue,
                numberedBreakdown: numberedBreakdown as unknown as Prisma.InputJsonValue,
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
