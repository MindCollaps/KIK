import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../../utils/prisma';
import { writeStoreLog } from '../../../../../utils/store';

// Setzt die nächste zu verkaufende Nummer eines Nummernpools
// (z. B. die erste Kartennummer des Tages). Bewusst mit KasseUse erlaubt,
// damit das Kassenpersonal die Startnummer selbst eintragen kann.
//
// expectedUpdatedAt ist eine Optimistic-Concurrency-Prüfung: der Client muss
// den zuletzt gesehenen Stand des Pools mitschicken. Weicht er vom
// tatsächlichen Stand ab (z. B. weil eine andere Kasse zwischenzeitlich
// verkauft oder die Nummer gesetzt hat), wird der Schreibvorgang mit 409
// abgelehnt statt den fremden Stand still zu überschreiben.
const numberSchema = z.object({
    nextNumber: z.number().int().min(0).max(100000000),
    expectedUpdatedAt: z.string().datetime(),
});

export default defineEventHandler(async event => {
    assertSameOrigin(event);
    const user = await requireAuth(event, Permission.KasseUse);

    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Ungültige Pool-ID.' });

    const parsed = numberSchema.safeParse(await readBody(event));
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' });
    }

    const pool = await prisma.numberPool.findUnique({ where: { id } });
    if (!pool) throw createError({ statusCode: 404, statusMessage: 'Der Nummernpool wurde nicht gefunden.' });

    // updateMany statt update: der updatedAt-Filter wirkt hier als atomarer
    // Compare-and-swap, sodass zwei gleichzeitige Schreibvorgänge nicht
    // beide auf demselben veralteten Stand basieren können (kein TOCTOU
    // zwischen der Prüfung oben und dem Schreiben).
    const expectedUpdatedAt = new Date(parsed.data.expectedUpdatedAt);
    const { count } = await prisma.numberPool.updateMany({
        where: { id, updatedAt: expectedUpdatedAt },
        data: { nextNumber: parsed.data.nextNumber },
    });

    if (count === 0) {
        const current = await prisma.numberPool.findUnique({ where: { id } });
        throw createError({
            statusCode: 409,
            statusMessage: 'Der Nummernstand wurde zwischenzeitlich von einer anderen Kasse geändert.',
            data: { pool: current ?? pool },
        });
    }

    const updated = await prisma.numberPool.findUniqueOrThrow({ where: { id } });
    await writeStoreLog('POOL_UPDATED', user, {
        poolId: pool.id,
        changes: { nextNumber: { from: pool.nextNumber, to: updated.nextNumber } },
    });

    return { pool: updated };
});
