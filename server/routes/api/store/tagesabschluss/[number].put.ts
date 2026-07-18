import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../utils/prisma';
import { recalculateTagesabschluss, writeStoreLog } from '../../../../utils/store';
import { loadTagesabschluss, toAbschlussResponse } from '../../../../utils/store-export';

const editSchema = z.object({
    openingCashCents: z.number().int().min(0).max(100000000).optional(),
    countedCashCents: z.number().int().min(0).max(100000000).optional(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseReportsEdit);

    const numberParam = Number(getRouterParam(event, 'number'));
    if (!Number.isInteger(numberParam) || numberParam < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Nummer.' });
    }

    const parsed = editSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const target = await prisma.tagesabschluss.findUnique({ where: { number: numberParam } });
    if (!target) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });

    const openingCashCents = parsed.data.openingCashCents ?? target.openingCashCents;
    const countedCashCents = parsed.data.countedCashCents ?? target.countedCashCents;

    await prisma.$transaction(async tx => {
        await tx.tagesabschluss.update({
            where: { number: numberParam },
            data: { openingCashCents, countedCashCents },
        });
        await recalculateTagesabschluss(numberParam, tx);
        await writeStoreLog('TAGESABSCHLUSS_UPDATED', user, {
            number: numberParam,
            before: { openingCashCents: target.openingCashCents, countedCashCents: target.countedCashCents },
            after: { openingCashCents, countedCashCents },
        }, undefined, tx);
    });

    const updated = await loadTagesabschluss(numberParam);
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });

    return { abschluss: toAbschlussResponse(updated) };
});
