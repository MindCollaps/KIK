import { requireAuth } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';
import { searchDoesTheDogDie } from '../../../utils/does-the-dog-die';

export default defineEventHandler(async (event): Promise<{ items: Awaited<ReturnType<typeof searchDoesTheDogDie>> }> => {
    await requireAuth(event, Permission.Program);
    const searchTerm = getQuery(event).q?.toString().trim() ?? '';
    if (searchTerm.length < 2) {
        throw createError({ statusCode: 400, statusMessage: 'Bitte gib mindestens zwei Zeichen ein.' });
    }

    return { items: await searchDoesTheDogDie(searchTerm) };
});