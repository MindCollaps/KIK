import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { computeNumberedStats, computePeriodStats, getLastTagesabschluss, loadOpenPeriodBons } from '../../../utils/store';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.KasseManage);

    const [lastAbschluss, bons] = await Promise.all([
        getLastTagesabschluss(),
        loadOpenPeriodBons(),
    ]);

    return {
        periodStart: lastAbschluss?.periodEnd ?? bons[0]?.createdAt ?? null,
        suggestedOpeningCashCents: lastAbschluss?.countedCashCents ?? 0,
        stats: computePeriodStats(bons),
        numberedPools: computeNumberedStats(bons),
    };
});
