import { requireAuthAny } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { listFilmsWithStats } from '../../../utils/film';

export default defineEventHandler(async event => {
    // Auch mit Programm-Berechtigung lesbar, damit der Filmpicker im
    // Programm-Editor ohne Films-Berechtigung funktioniert.
    await requireAuthAny(event, Permission.Program, Permission.Films);

    return { films: await listFilmsWithStats() };
});
