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
    const items = await prisma.storeItem.findMany({ where: { id: { in: itemIds }, archived: false } });
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

        return {
            itemId: item.id,
            name: item.name,
            unitPriceCents,
            quantity: line.quantity,
        };
    });

    const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

    const bon = await prisma.bon.create({
        data: {
            paymentMethod: parsed.data.paymentMethod,
            totalCents,
            createdById: user.id,
            createdByName: user.name,
            items: { create: lines },
        },
        include: bonInclude,
    });

    await writeStoreLog('BON_CREATED', user, {
        paymentMethod: bon.paymentMethod,
        totalCents: bon.totalCents,
        items: lines,
    }, bon.number);

    return { bon: toBonResponse(bon) };
});
