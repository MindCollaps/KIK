import type { Permission } from '~~/types/permissions';
import { hasAllPermissions, hasAnyPermission } from '~~/types/permissions';
import { useStore } from '~/store';

export function usePermissions() {
    const store = useStore();

    const permissions = computed<readonly Permission[]>(() => store.adminUser?.permissions ?? []);

    function can(...required: Permission[]) {
        return hasAllPermissions(permissions.value, required);
    }

    function canAny(...required: Permission[]) {
        return hasAnyPermission(permissions.value, required);
    }

    return { permissions, can, canAny };
}
