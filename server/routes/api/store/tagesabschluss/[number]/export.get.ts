import { z } from 'zod';
import { requireAuthAny } from '../../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { buildCsv, buildPdf, buildXlsx, loadTagesabschluss } from '../../../../../utils/store-export';

const formatSchema = z.enum(['csv', 'xlsx', 'pdf']);

export default defineEventHandler(async event => {
    await requireAuthAny(event, Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage);

    const numberParam = Number(getRouterParam(event, 'number'));
    if (!Number.isInteger(numberParam) || numberParam < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige Nummer.' });
    }

    const parsedFormat = formatSchema.safeParse(getQuery(event).format);
    if (!parsedFormat.success) {
        throw createError({ statusCode: 400, statusMessage: 'Unbekanntes Exportformat.' });
    }

    const abschluss = await loadTagesabschluss(numberParam);
    if (!abschluss) throw createError({ statusCode: 404, statusMessage: 'Der Tagesabschluss wurde nicht gefunden.' });

    const filename = `tagesabschluss-${abschluss.number}`;

    switch (parsedFormat.data) {
        case 'csv': {
            setResponseHeaders(event, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}.csv"`,
            });
            return buildCsv(abschluss);
        }
        case 'xlsx': {
            setResponseHeaders(event, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
            });
            return buildXlsx(abschluss);
        }
        case 'pdf': {
            setResponseHeaders(event, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            });
            return buildPdf(abschluss);
        }
    }
});
