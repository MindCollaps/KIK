import type { Permission } from '~~/types/permissions';
import { hasAnyPermission } from '~~/types/permissions';
import type { AdminUser } from '~~/types/user';
import { useStore } from '~/store';

// Lädt den angemeldeten Nutzer und wirft 404, wenn er fehlt oder keine der
// Berechtigungen hat – die Kassenseiten geben ihre Existenz nicht preis.
export async function requireStorePermission(...required: Permission[]) {
    const store = useStore();

    const requestFetch = useRequestFetch();
    const { user } = await requestFetch<{ user: AdminUser | null }>('/api/auth/me');
    store.adminUser = user;

    if (!user || !hasAnyPermission(user.permissions, required)) {
        throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden', fatal: true });
    }

    return user;
}
