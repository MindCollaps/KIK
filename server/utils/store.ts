import type { AdminUser, Prisma, StoreLogType } from '@prisma/client';
import type { BreakdownCategory, PeriodStats } from '~~/types/store';
import { BonStatus, PaymentMethod } from '~~/types/store';
import { prisma } from './prisma';

export type BonWithItems = Prisma.BonGetPayload<{
    include: { items: { include: { item: { include: { category: true } } } } };
}>;

export const bonInclude = {
    items: { include: { item: { include: { category: true } } } },
} satisfies Prisma.BonInclude;

export async function writeStoreLog(type: StoreLogType, actor: AdminUser, details: Prisma.InputJsonValue, bonNumber?: number, db: Prisma.TransactionClient = prisma) {
    await db.storeAuditLog.create({
        data: {
            type,
            actorId: actor.id,
            actorName: actor.name,
            bonNumber: bonNumber ?? null,
            details,
        },
    });
}

export async function getLastTagesabschluss() {
    return prisma.tagesabschluss.findFirst({ orderBy: { number: 'desc' } });
}

export async function loadOpenPeriodBons(): Promise<BonWithItems[]> {
    return prisma.bon.findMany({
        where: { tagesabschlussId: null },
        include: bonInclude,
        orderBy: { number: 'asc' },
    });
}

export function computePeriodStats(bons: BonWithItems[]): PeriodStats {
    const completed = bons.filter(bon => bon.status === BonStatus.Completed);
    const cancelled = bons.filter(bon => bon.status === BonStatus.Cancelled);

    const categories = new Map<string, { totalCents: number; items: Map<string, { name: string; unitPriceCents: number; quantity: number; totalCents: number } > }>();

    for (const bon of completed) {
        for (const line of bon.items) {
            const categoryName = line.item?.category.name ?? 'Sonstiges';
            let category = categories.get(categoryName);
            if (!category) {
                category = { totalCents: 0, items: new Map() };
                categories.set(categoryName, category);
            }

            const lineTotal = line.unitPriceCents * line.quantity;
            const itemKey = `${line.name}|${line.unitPriceCents}`;
            const entry = category.items.get(itemKey) ?? { name: line.name, unitPriceCents: line.unitPriceCents, quantity: 0, totalCents: 0 };
            entry.quantity += line.quantity;
            entry.totalCents += lineTotal;
            category.items.set(itemKey, entry);
            category.totalCents += lineTotal;
        }
    }

    const breakdown: BreakdownCategory[] = [...categories.entries()]
        .map(([categoryName, category]) => ({
            categoryName,
            totalCents: category.totalCents,
            items: [...category.items.values()].sort((a, b) => b.totalCents - a.totalCents),
        }))
        .sort((a, b) => b.totalCents - a.totalCents);

    return {
        bonCount: completed.length,
        stornoCount: cancelled.length,
        stornoTotalCents: cancelled.reduce((sum, bon) => sum + bon.totalCents, 0),
        revenueCents: completed.reduce((sum, bon) => sum + bon.totalCents, 0),
        cashRevenueCents: completed.filter(bon => bon.paymentMethod === PaymentMethod.Cash).reduce((sum, bon) => sum + bon.totalCents, 0),
        cardRevenueCents: completed.filter(bon => bon.paymentMethod === PaymentMethod.Card).reduce((sum, bon) => sum + bon.totalCents, 0),
        breakdown,
    };
}

export async function recalculateTagesabschluss(number: number, db: Prisma.TransactionClient = prisma) {
    const abschluss = await db.tagesabschluss.findUnique({ where: { number } });
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });

    const bons = await db.bon.findMany({
        where: { tagesabschlussId: number },
        include: bonInclude,
        orderBy: { number: 'asc' },
    });
    const stats = computePeriodStats(bons);
    const expectedCashCents = abschluss.openingCashCents + stats.cashRevenueCents;

    return db.tagesabschluss.update({
        where: { number },
        data: {
            ...stats,
            breakdown: stats.breakdown as unknown as Prisma.InputJsonValue,
            expectedCashCents,
            differenceCents: abschluss.countedCashCents - expectedCashCents,
        },
    });
}

export function toBonResponse(bon: BonWithItems) {
    return {
        number: bon.number,
        status: bon.status,
        paymentMethod: bon.paymentMethod,
        totalCents: bon.totalCents,
        createdByName: bon.createdByName,
        createdAt: bon.createdAt,
        cancelledAt: bon.cancelledAt,
        cancelledByName: bon.cancelledByName,
        cancelReason: bon.cancelReason,
        items: bon.items.map(line => ({
            id: line.id,
            itemId: line.itemId,
            name: line.name,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
        })),
    };
}

export function formatEuro(cents: number) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatDateTimeBerlin(value: Date) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    }).format(value);
}
