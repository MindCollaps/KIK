import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { computePeriodStats, loadOpenPeriodBons, toBonResponse } from '../../../utils/store';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.KasseUse);

    // Alle Bons der offenen Periode (seit dem letzten Tagesabschluss)
    const bons = await loadOpenPeriodBons();

    return {
        bons: bons.map(toBonResponse).reverse(),
        stats: computePeriodStats(bons),
    };
});
