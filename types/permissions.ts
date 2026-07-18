export const Permission = {
    Pages: 'PAGES',
    Program: 'PROGRAM',
    Settings: 'SETTINGS',
    KasseUse: 'KASSE_USE',
    KasseReports: 'KASSE_REPORTS',
    KasseManage: 'KASSE_MANAGE',
    Users: 'USERS',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const allPermissions: readonly Permission[] = Object.values(Permission);

export const permissionLabels: Record<Permission, string> = {
    [Permission.Pages]: 'Seiten bearbeiten',
    [Permission.Program]: 'Programm bearbeiten',
    [Permission.Settings]: 'Website-Einstellungen ändern',
    [Permission.KasseUse]: 'Kassensystem verwenden',
    [Permission.KasseReports]: 'Kassenberichte einsehen',
    [Permission.KasseManage]: 'Kassensystem verwalten',
    [Permission.Users]: 'Nutzer verwalten',
};

export function hasAllPermissions(granted: readonly Permission[], required: readonly Permission[]): boolean {
    return required.every(permission => granted.includes(permission));
}

export function hasAnyPermission(granted: readonly Permission[], required: readonly Permission[]): boolean {
    return required.some(permission => granted.includes(permission));
}
