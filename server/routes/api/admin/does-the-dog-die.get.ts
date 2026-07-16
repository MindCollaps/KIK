import { requireAdmin } from '../../../utils/auth';
import { searchDoesTheDogDie } from '../../../utils/does-the-dog-die';

export default defineEventHandler(async (event): Promise<{ items: Awaited<ReturnType<typeof searchDoesTheDogDie>> }> => {
    await requireAdmin(event);
    const searchTerm = getQuery(event).q?.toString().trim() ?? '';
    if (searchTerm.length < 2) {
        throw createError({ statusCode: 400, statusMessage: 'Bitte gib mindestens zwei Zeichen ein.' });
    }

    return { items: await searchDoesTheDogDie(searchTerm) };
});