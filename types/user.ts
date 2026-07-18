import type { Permission } from './permissions';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    permissions: Permission[];
}

export interface AdminUserRecord extends AdminUser {
    lastLoginAt: string | null;
    emailConfirmedAt: string | null;
    createdAt: string;
}

export interface WebUser {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    isAdmin: boolean;
    loggedIn: boolean;
}