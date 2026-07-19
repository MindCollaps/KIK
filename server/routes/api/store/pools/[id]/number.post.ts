import { z } from 'zod';
import { assertSameOrigin, requireAuth } from '../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../../../utils/prisma';
import { writeStoreLog } from '../../../../../utils/store';

// Setzt die nächste zu verkaufende Nummer eines Nummernpools
// (z. B. die erste Kartennummer des Tages). Bewusst mit KasseUse erlaubt,
// damit das Kassenpersonal die Startnummer selbst eintragen kann.
const numberSchema = z.object({
    nextNumber: z.number().int().min(0).max(100000000),
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

    const updated = await prisma.numberPool.update({ where: { id }, data: { nextNumber: parsed.data.nextNumber } });
    await writeStoreLog('POOL_UPDATED', user, {
        poolId: pool.id,
        changes: { nextNumber: { from: pool.nextNumber, to: updated.nextNumber } },
    });

    return { pool: updated };
});
