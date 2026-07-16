<template>
    <main class="admin-page">
        <admin-header :user="currentUser" @logout="logout" />

        <admin-auth-panel
            v-if="!currentUser"
            :registration-open="registrationOpen"
            @authenticated="onAuthenticated"
        />

        <template v-else>
            <nav class="admin-tabs" aria-label="Verwaltungsbereiche">
                <button
                    v-for="tab in adminTabs"
                    :key="tab.value"
                    type="button"
                    :class="{ 'admin-tabs_button--active': activeTab === tab.value }"
                    class="admin-tabs_button"
                    @click="activeTab = tab.value"
                >
                    <Icon :name="tab.icon" aria-hidden="true" />
                    {{ tab.label }}
                </button>
            </nav>

            <admin-program-panel v-if="activeTab === 'program'" />
            <admin-pages-panel v-else-if="activeTab === 'pages'" />
            <admin-site-panel v-else-if="activeTab === 'site'" />
            <admin-users-panel v-else :current-user-id="currentUser?.id ?? ''" />
        </template>
    </main>
</template>

<script setup lang="ts">
import type { AdminUser } from '~~/types/user';

definePageMeta({ layout: 'empty' });
useHead({ title: 'Programmverwaltung' });

const requestFetch = useRequestFetch();
const [setupResponse, meResponse] = await Promise.all([
    requestFetch<{ registrationOpen: boolean }>('/api/auth/setup'),
    requestFetch<{ user: AdminUser | null }>('/api/auth/me'),
]);

const registrationOpen = ref(setupResponse.registrationOpen);
const currentUser = ref(meResponse.user);

type AdminTab = 'program' | 'pages' | 'site' | 'users';
const activeTab = ref<AdminTab>('program');
const adminTabs: Array<{ value: AdminTab; label: string; icon: string }> = [
    { value: 'program', label: 'Programm', icon: 'material-symbols:movie-rounded' },
    { value: 'pages', label: 'Seiten', icon: 'material-symbols:web' },
    { value: 'site', label: 'Website', icon: 'material-symbols:settings-rounded' },
    { value: 'users', label: 'Nutzer', icon: 'material-symbols:group-rounded' },
];

function onAuthenticated(user: AdminUser) {
    currentUser.value = user;
    registrationOpen.value = false;
    activeTab.value = 'program';
}

async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    currentUser.value = null;
}
</script>

<style scoped lang="scss">
.admin-page {
    min-height: 100dvh;
    color: $lightgray150;
    background:
        radial-gradient(circle at 8% 0%, rgb(196 48 31 / 16%), transparent 36%),
        $darkgray1000;
}

.admin-tabs {
    display: flex;
    gap: 0.4rem;

    padding: 0.6rem 1.5rem;
    border-bottom: 1px solid $darkgray850;

    background: $darkgray950;

    &_button {
        cursor: pointer;

        display: inline-flex;
        gap: 0.45rem;
        align-items: center;

        min-height: 40px;
        padding: 0 0.9rem;
        border: 1px solid transparent;
        border-radius: 999px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray200;

        background: transparent;

        svg {
            width: 1.1rem;
            height: 1.1rem;
        }

        &--active {
            border-color: $secondary600;
            color: $secondary300;
            background: rgb(192 143 46 / 8%);
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

@include mobileOnly {
    .admin-tabs {
        overflow-x: auto;
        padding: 0.6rem 0.8rem;
    }
}
</style>
