import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { BonStatus } from '~~/types/store';
import { prisma } from '../../../../../utils/prisma';
import { bonInclude, toBonResponse, writeStoreLog } from '../../../../../utils/store';

const stornoSchema = z.object({
    reason: z.string().trim().min(3).max(300),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseUse);

    const numberParam = Number(getRouterParam(event, 'number'));
    if (!Number.isInteger(numberParam) || numberParam < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Bon-Nummer.' });
    }

    const parsed = stornoSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Bitte gib einen Stornogrund an (mindestens 3 Zeichen).' });
    }

    const bon = await prisma.bon.findUnique({ where: { number: numberParam } });
    if (!bon) throw createError({ statusCode: 404, statusMessage: 'Der Bon wurde nicht gefunden.' });

    if (bon.status === BonStatus.Cancelled) {
        throw createError({ statusCode: 400, statusMessage: 'Dieser Bon wurde bereits storniert.' });
    }
    if (bon.tagesabschlussId !== null) {
        throw createError({ statusCode: 400, statusMessage: 'Dieser Bon gehört zu einem abgeschlossenen Tagesabschluss und kann nicht mehr storniert werden.' });
    }

    const updated = await prisma.bon.update({
        where: { number: bon.number },
        data: {
            status: BonStatus.Cancelled,
            cancelledAt: new Date(),
            cancelledById: user.id,
            cancelledByName: user.name,
            cancelReason: parsed.data.reason,
        },
        include: bonInclude,
    });

    await writeStoreLog('BON_CANCELLED', user, {
        reason: parsed.data.reason,
        totalCents: updated.totalCents,
    }, updated.number);

    return { bon: toBonResponse(updated) };
});
