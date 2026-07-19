export const Permission = {
    Pages: 'PAGES',
    Program: 'PROGRAM',
    Settings: 'SETTINGS',
    KasseUse: 'KASSE_USE',
    KasseReports: 'KASSE_REPORTS',
    KasseReportsEdit: 'KASSE_REPORTS_EDIT',
    KasseManage: 'KASSE_MANAGE',
    Users: 'USERS',
    Films: 'FILMS',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const allPermissions: readonly Permission[] = Object.values(Permission);

export const permissionLabels: Record<Permission, string> = {
    [Permission.Pages]: 'Seiten bearbeiten',
    [Permission.Program]: 'Programm bearbeiten',
    [Permission.Settings]: 'Website-Einstellungen ändern',
    [Permission.KasseUse]: 'Kassensystem verwenden',
    [Permission.KasseReports]: 'Kassenberichte einsehen',
    [Permission.KasseReportsEdit]: 'Kassenberichte bearbeiten',
    [Permission.KasseManage]: 'Kassensystem verwalten',
    [Permission.Users]: 'Nutzer verwalten',
    [Permission.Films]: 'Filme bearbeiten',
};

export function hasAllPermissions(granted: readonly Permission[], required: readonly Permission[]): boolean {
    return required.every(permission => granted.includes(permission));
}

export function hasAnyPermission(granted: readonly Permission[], required: readonly Permission[]): boolean {
    return required.some(permission => granted.includes(permission));
}
