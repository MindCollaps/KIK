<template>
    <main class="admin-page">
        <admin-header :user="currentUser" @logout="logout" />

        <admin-auth-panel
            v-if="!currentUser || setPasswordToken"
            :registration-open="registrationOpen"
            :set-password-token="setPasswordToken"
            @authenticated="onAuthenticated"
        />

        <template v-else>
            <nav v-if="visibleTabs.length" class="admin-tabs" aria-label="Verwaltungsbereiche">
                <ui-button
                    v-for="tab in visibleTabs"
                    :key="tab.value"
                    class="admin-tabs_button"
                    tag="button"
                    type="pill"
                    :active="activeTab === tab.value"
                    @click="activeTab = tab.value"
                >
                    <Icon :name="tab.icon" aria-hidden="true" />
                    {{ tab.label }}
                </ui-button>
                <ui-button
                    v-if="storeDestination"
                    :to="storeDestination"
                    class="admin-tabs_button"
                    type="pill"
                >
                    <Icon name="material-symbols:point-of-sale" aria-hidden="true" />
                    Kasse
                </ui-button>
            </nav>

            <div v-if="!visibleTabs.length" class="admin-empty" role="status">
                <p>Dein Konto hat keine Berechtigungen für die Website-Verwaltung.</p>
                <ui-button v-if="storeDestination" :to="storeDestination" class="admin-empty_store-link" type="primary">
                    <Icon name="material-symbols:point-of-sale" aria-hidden="true" />
                    Zum Kassensystem
                </ui-button>
                <p v-else>Wende dich an eine Person mit Nutzerverwaltung.</p>
            </div>
            <template v-else>
                <admin-program-panel v-if="activeTab === 'program'" />
                <admin-film-panel v-else-if="activeTab === 'films'" />
                <admin-pages-panel v-else-if="activeTab === 'pages'" />
                <admin-site-panel v-else-if="activeTab === 'site'" />
                <admin-users-panel v-else-if="activeTab === 'users'" :current-user-id="currentUser?.id ?? ''" />
            </template>
            <views-view-version v-if="meResponse.user"/>
        </template>
    </main>
</template>

<script setup lang="ts">
import type { AdminUser } from '~~/types/user';
import { Permission } from '~~/types/permissions';
import { usePageSeo } from '~/composables/seo';
import { usePermissions } from '~/composables/permissions';
import { useStore } from '~/store';

definePageMeta({ layout: 'empty' });
usePageSeo(() => ({ title: 'Programmverwaltung', noindex: true }));

const store = useStore();
const { can, canAny } = usePermissions();
const route = useRoute();
const router = useRouter();

// Link aus Einladungs- oder Passwort-Zurücksetzen-E-Mail
const setPasswordToken = computed(() => {
    const { action, token } = route.query;
    return action === 'set-password' && typeof token === 'string' && token ? token : null;
});

const requestFetch = useRequestFetch();
const [setupResponse, meResponse] = await Promise.all([
    requestFetch<{ registrationOpen: boolean }>('/api/auth/setup'),
    requestFetch<{ user: AdminUser | null }>('/api/auth/me'),
]);

const registrationOpen = ref(setupResponse.registrationOpen);
const currentUser = ref(meResponse.user);
store.adminUser = meResponse.user;

type AdminTab = 'program' | 'films' | 'pages' | 'site' | 'users';
const adminTabs: Array<{ value: AdminTab; label: string; icon: string; permission: Permission }> = [
    { value: 'program', label: 'Programm', icon: 'material-symbols:movie-rounded', permission: Permission.Program },
    { value: 'films', label: 'Filme', icon: 'material-symbols:movie-rounded', permission: Permission.Films },
    { value: 'pages', label: 'Seiten', icon: 'material-symbols:web', permission: Permission.Pages },
    { value: 'site', label: 'Website', icon: 'material-symbols:settings-rounded', permission: Permission.Settings },
    { value: 'users', label: 'Nutzer', icon: 'material-symbols:group-rounded', permission: Permission.Users },
];

const visibleTabs = computed(() => adminTabs.filter(tab => can(tab.permission)));
const storeDestination = computed(() => {
    if (can(Permission.KasseUse)) return '/store';
    if (can(Permission.KasseManage)) return '/store/admin';
    if (canAny(Permission.KasseReports, Permission.KasseReportsEdit)) return '/store/tagesabschluss';
    return null;
});
const activeTab = ref<AdminTab | null>(visibleTabs.value[0]?.value ?? null);

watch(visibleTabs, tabs => {
    if (!tabs.some(tab => tab.value === activeTab.value)) {
        activeTab.value = tabs[0]?.value ?? null;
    }
});

function onAuthenticated(user: AdminUser) {
    currentUser.value = user;
    store.adminUser = user;
    registrationOpen.value = false;
    if (setPasswordToken.value) router.replace({ query: {} });
}

async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    currentUser.value = null;
    store.adminUser = null;
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

.admin-empty {
    max-width: 40rem;
    margin: 3rem auto;
    padding: 0 1.5rem;

    color: $lightgray300;
    text-align: center;

    p {
        margin: 0.75rem 0;
    }

    &_store-link {
        display: inline-flex;
        gap: 0.45rem;
        align-items: center;

        min-height: 42px;
        padding: 0 1rem;
        border-radius: 8px;

        font-weight: 700;
        color: $whiteOrig;
        text-decoration: none;

        background: $primary500;

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 2px;
        }
    }
}

.admin-tabs {
    display: flex;
    gap: 0.4rem;

    padding: 0.6rem 1.5rem;
    border-bottom: 1px solid $darkgray850;

    background: $darkgray950;

    &_button {
        font-size: 0.85rem;

        svg {
            width: 1.1rem;
            height: 1.1rem;
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
