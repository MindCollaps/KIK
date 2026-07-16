export interface AdminUser {
    id: string;
    name: string;
    email: string;
}

export interface AdminUserRecord extends AdminUser {
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