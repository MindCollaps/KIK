import { requireAuthAny } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { loadTagesabschluss, toAbschlussResponse } from '../../../../utils/store-export';

export default defineEventHandler(async event => {
    await requireAuthAny(event, Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage);

    const numberParam = Number(getRouterParam(event, 'number'));
    if (!Number.isInteger(numberParam) || numberParam < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Nummer.' });
    }

    const abschluss = await loadTagesabschluss(numberParam);
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });

    return { abschluss: toAbschlussResponse(abschluss) };
});
