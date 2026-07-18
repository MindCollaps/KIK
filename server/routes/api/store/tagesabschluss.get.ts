import { requireAuthAny } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { prisma } from '../../../utils/prisma';

export default defineEventHandler(async event => {
    await requireAuthAny(event, Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage);

    const entries = await prisma.tagesabschluss.findMany({
        orderBy: { number: 'desc' },
        select: {
            number: true,
            periodStart: true,
            periodEnd: true,
            revenueCents: true,
            differenceCents: true,
            bonCount: true,
            stornoCount: true,
            createdByName: true,
            createdAt: true,
        },
    });

    return { entries };
});
