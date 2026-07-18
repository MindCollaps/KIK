import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { PaymentMethod } from '~~/types/store';

export const reportBonSchema = z.object({
    paymentMethod: z.enum(PaymentMethod),
    createdAt: z.coerce.date(),
    items: z.array(z.object({
        lineId: z.string().uuid().optional(),
        itemId: z.string().uuid().optional(),
        quantity: z.number().int().min(1).max(99),
        unitPriceCents: z.number().int().min(0).max(1000000),
    }).refine(line => line.lineId || line.itemId, { message: 'Jede Position benötigt einen Artikel.' })).min(1).max(100),
});

export type ReportBonInput = z.infer<typeof reportBonSchema>;

export async function resolveReportBonLines(db: Prisma.TransactionClient, input: ReportBonInput, bonNumber?: number) {
    const itemIds = input.items.flatMap(line => line.itemId ? [line.itemId] : []);
    const lineIds = input.items.flatMap(line => line.lineId ? [line.lineId] : []);
    if (new Set(lineIds).size !== lineIds.length) {
        throw createError({ statusCode: 400, statusMessage: 'Eine bestehende Bon-Position darf nur einmal verwendet werden.' });
    }

    const [items, existingLines] = await Promise.all([
        db.storeItem.findMany({ where: { id: { in: itemIds } } }),
        bonNumber
            ? db.bonItem.findMany({ where: { id: { in: lineIds }, bonNumber } })
            : Promise.resolve([]),
    ]);
    const itemsById = new Map(items.map(item => [item.id, item]));
    const linesById = new Map(existingLines.map(line => [line.id, line]));

    return input.items.map(line => {
        const item = line.itemId ? itemsById.get(line.itemId) : undefined;
        const existing = line.lineId ? linesById.get(line.lineId) : undefined;
        if (!item && !existing) {
            throw createError({ statusCode: 400, statusMessage: 'Ein ausgewählter Artikel oder eine Bon-Position ist nicht mehr verfügbar.' });
        }

        return {
            itemId: item?.id ?? existing?.itemId ?? null,
            name: item?.name ?? existing!.name,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
        };
    });
}