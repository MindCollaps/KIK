import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { PaymentMethod } from '~~/types/store';
import { prisma } from '../../../utils/prisma';
import { bonInclude, toBonResponse, writeStoreLog } from '../../../utils/store';

const bonSchema = z.object({
    paymentMethod: z.enum(PaymentMethod),
    items: z.array(z.object({
        itemId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        priceCents: z.number().int().min(0).max(1000000).optional(),
    })).min(1).max(100),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseUse);

    const parsed = bonSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const itemIds = [...new Set(parsed.data.items.map(line => line.itemId))];
    const items = await prisma.storeItem.findMany({ where: { id: { in: itemIds }, archived: false }, include: { numberPool: true } });
    const itemsById = new Map(items.map(item => [item.id, item]));

    const lines = parsed.data.items.map(line => {
        const item = itemsById.get(line.itemId);
        if (!item) {
            throw createError({ statusCode: 400, statusMessage: 'Ein Artikel ist nicht mehr verfügbar. Bitte lade die Kasse neu.' });
        }

        let unitPriceCents = item.priceCents;
        if (item.freePrice) {
            if (line.priceCents === undefined || line.priceCents <= 0) {
                throw createError({ statusCode: 400, statusMessage: `Für „${item.name}“ muss ein Preis angegeben werden.` });
            }
            unitPriceCents = line.priceCents;
        }

        if (item.numberPool && item.numberPool.nextNumber === null) {
            throw createError({ statusCode: 400, statusMessage: `Für „${item.numberPool.name}“ muss zuerst die Start-Nummer festgelegt werden.` });
        }

        return {
            itemId: item.id,
            name: item.name,
            unitPriceCents,
            quantity: line.quantity,
            numberPool: item.numberPool,
        };
    });

    const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

    const bon = await prisma.$transaction(async transaction => {
        const lineData: Array<{ itemId: string; name: string; unitPriceCents: number; quantity: number; firstNumber?: number; lastNumber?: number; numberPoolId?: string }> = [];

        for (const line of lines) {
            const { numberPool, ...data } = line;
            if (!numberPool) {
                lineData.push(data);
                continue;
            }

            // Atomar hochzählen – so kollidieren zwei gleichzeitige Verkäufe nicht
            const updated = await transaction.numberPool.update({
                where: { id: numberPool.id },
                data: { nextNumber: { increment: line.quantity } },
            });
            if (updated.nextNumber === null) {
                throw createError({ statusCode: 400, statusMessage: `Für „${numberPool.name}“ muss zuerst die Start-Nummer festgelegt werden.` });
            }
            lineData.push({
                ...data,
                firstNumber: updated.nextNumber - line.quantity,
                lastNumber: updated.nextNumber - 1,
                numberPoolId: numberPool.id,
            });
        }

        return transaction.bon.create({
            data: {
                paymentMethod: parsed.data.paymentMethod,
                totalCents,
                createdById: user.id,
                createdByName: user.name,
                items: { create: lineData },
            },
            include: bonInclude,
        });
    });

    await writeStoreLog('BON_CREATED', user, {
        paymentMethod: bon.paymentMethod,
        totalCents: bon.totalCents,
        items: bon.items.map(line => ({
            itemId: line.itemId,
            name: line.name,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
            firstNumber: line.firstNumber,
            lastNumber: line.lastNumber,
        })),
    }, bon.number);

    return { bon: toBonResponse(bon) };
});
