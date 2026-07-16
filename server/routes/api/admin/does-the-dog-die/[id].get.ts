import { requireAdmin } from '../../../../utils/auth';
import { getDoesTheDogDieSnapshot } from '../../../../utils/does-the-dog-die';

export default defineEventHandler(async event => {
    await requireAdmin(event);
    const itemId = Number(getRouterParam(event, 'id'));
    if (!Number.isInteger(itemId) || itemId <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige DoesTheDogDie-ID.' });
    }

    return { item: await getDoesTheDogDieSnapshot(itemId) };
});