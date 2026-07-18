import { requireAuth } from '../../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { getDoesTheDogDieSnapshot } from '../../../../utils/does-the-dog-die';

export default defineEventHandler(async event => {
    await requireAuth(event, Permission.Program);
    const itemId = Number(getRouterParam(event, 'id'));
    if (!Number.isInteger(itemId) || itemId <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Ungültige DoesTheDogDie-ID.' });
    }

    return { item: await getDoesTheDogDieSnapshot(itemId) };
});