<template>
    <section class="users-panel">
        <header class="users-panel_intro">
            <div>
                <p>Verwaltung</p>
                <h1>Nutzer</h1>
            </div>
        </header>

        <p v-if="message" class="users-panel_message" :class="{ 'users-panel_message--error': messageIsError }" role="alert">
            {{ message }}
        </p>

        <div class="users-panel_section">
            <h2>Administrationskonten</h2>

            <div class="users-toolbar">
                <ui-input-search
                    v-model="searchQuery"
                    class="users-toolbar_search"
                    placeholder="Nach Name oder E-Mail suchen …"
                    aria-label="Nutzer durchsuchen"
                />
                <div class="users-toolbar_sort" role="group" aria-label="Sortierung">
                    <button
                        v-for="option in sortOptions"
                        :key="option.value"
                        type="button"
                        class="users-toolbar_sort-button"
                        :class="{ 'users-toolbar_sort-button--active': sortField === option.value }"
                        @click="setSort(option.value)"
                    >
                        {{ option.label }}
                        <Icon
                            v-if="sortField === option.value"
                            :name="sortDirection === 'asc' ? 'material-symbols:arrow-upward-rounded' : 'material-symbols:arrow-downward-rounded'"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

            <div v-if="pending" class="users-panel_state">Nutzer werden geladen …</div>
            <div v-else-if="!filteredUsers.length" class="users-panel_state">
                {{ searchQuery ? 'Keine Nutzer gefunden.' : 'Noch keine Nutzer vorhanden.' }}
            </div>
            <div v-else class="user-list">
                <article v-for="user in filteredUsers" :key="user.id" class="user-row" :class="{ 'user-row--inactive': !user.active }">
                    <div class="user-row_main">
                        <strong>{{ user.name }}</strong>
                        <span class="user-row_email">{{ user.email }}</span>
                        <span class="user-row_meta">
                            Seit {{ formatDate(user.createdAt) }}
                            · {{ user.lastLoginAt ? `Zuletzt angemeldet ${formatDateTime(user.lastLoginAt)}` : 'Noch nie angemeldet' }}
                            <template v-if="user.id === currentUserId"> · Dein Konto</template>
                            <span v-if="!user.active" class="user-row_pending user-row_pending--inactive">Deaktiviert</span>
                            <span v-if="!user.emailConfirmedAt" class="user-row_pending">Bestätigung ausstehend</span>
                        </span>
                    </div>
                    <button
                        type="button"
                        class="icon-button icon-button--danger"
                        :disabled="user.id === currentUserId || deletingId === user.id || users.length <= 1"
                        :aria-label="`${user.name} entfernen`"
                        @click="deleteUser(user)"
                    >
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                    <div class="user-row_permissions">
                        <admin-permission-select
                            :model-value="draftPermissions[user.id] ?? []"
                            class="user-row_permission-select"
                            @update:model-value="draftPermissions[user.id] = $event"
                        />
                        <button
                            v-if="isDirty(user)"
                            type="button"
                            class="save-button save-button--small"
                            :disabled="savingId === user.id"
                            @click="savePermissions(user)"
                        >
                            <Icon :name="savingId === user.id ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                            {{ savingId === user.id ? 'Wird gespeichert …' : 'Speichern' }}
                        </button>
                        <button type="button" class="row-button" @click="startSetPassword(user)">
                            Passwort setzen
                        </button>
                        <button
                            v-if="user.id !== currentUserId"
                            type="button"
                            class="row-button"
                            :class="{ 'row-button--danger': user.active }"
                            :disabled="togglingId === user.id"
                            @click="toggleActive(user)"
                        >
                            {{ user.active ? 'Deaktivieren' : 'Aktivieren' }}
                        </button>
                    </div>
                    <div v-if="passwordUserId === user.id" class="user-row_password">
                        <input
                            v-model="passwordInput"
                            type="password"
                            minlength="12"
                            maxlength="128"
                            placeholder="Neues Passwort (mindestens 12 Zeichen)"
                            autocomplete="new-password"
                            @keyup.enter="savePassword(user)"
                        >
                        <button
                            type="button"
                            class="save-button save-button--small"
                            :disabled="passwordSaving"
                            @click="savePassword(user)"
                        >
                            {{ passwordSaving ? 'Wird gespeichert …' : 'Passwort speichern' }}
                        </button>
                        <button type="button" class="row-button" @click="closeSetPassword">Abbrechen</button>
                    </div>
                </article>
            </div>
        </div>

        <div class="users-panel_section">
            <h2>Neues Konto anlegen</h2>
            <form class="new-user-form" @submit.prevent="createUser">
                <label class="field">
                    <span>Name</span>
                    <input v-model.trim="form.name" required minlength="2" maxlength="80" autocomplete="off">
                </label>
                <label class="field">
                    <span>E-Mail-Adresse</span>
                    <input v-model.trim="form.email" required type="email" maxlength="254" autocomplete="off">
                </label>
                <admin-permission-select v-model="form.permissions">
                    Berechtigungen
                </admin-permission-select>
                <small class="new-user-form_note">
                    Die Person erhält eine E-Mail, um das Konto zu bestätigen und ihr Passwort selbst festzulegen.
                </small>
                <button type="submit" class="save-button" :disabled="creating">
                    <Icon :name="creating ? 'material-symbols:progress-activity' : 'material-symbols:person-add-rounded'" aria-hidden="true" />
                    {{ creating ? 'Wird angelegt …' : 'Nutzer anlegen' }}
                </button>
            </form>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { AdminUserRecord } from '~~/types/user';
import type { Permission } from '~~/types/permissions';
import { useStore } from '~/store';

const props = defineProps<{
    currentUserId: string;
}>();

interface ApiError {
    data?: { statusMessage?: string };
}

const store = useStore();
const users = ref<AdminUserRecord[]>([]);
const pending = ref(false);
const creating = ref(false);
const deletingId = ref<string | null>(null);
const savingId = ref<string | null>(null);
const togglingId = ref<string | null>(null);
const passwordUserId = ref<string | null>(null);
const passwordInput = ref('');
const passwordSaving = ref(false);
const draftPermissions = ref<Record<string, Permission[]>>({});
const message = ref('');
const messageIsError = ref(false);
const form = reactive({ name: '', email: '', permissions: [] as Permission[] });

type SortField = 'name' | 'lastLoginAt' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const searchQuery = ref('');
const sortField = ref<SortField>('createdAt');
const sortDirection = ref<SortDirection>('asc');

const sortOptions: Array<{ value: SortField; label: string }> = [
    { value: 'name', label: 'Name' },
    { value: 'lastLoginAt', label: 'Letzter Login' },
    { value: 'createdAt', label: 'Erstellt' },
];

function setSort(field: SortField) {
    if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        return;
    }
    sortField.value = field;
    // Bei Datumsfeldern ist "neueste zuerst" der nützlichere Einstieg
    sortDirection.value = field === 'name' ? 'asc' : 'desc';
}

const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase();
    const matches = query
        ? users.value.filter(user => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
        : [...users.value];

    const direction = sortDirection.value === 'asc' ? 1 : -1;
    return matches.sort((a, b) => {
        if (sortField.value === 'name') {
            return direction * a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
        }
        const aValue = sortField.value === 'lastLoginAt' ? a.lastLoginAt : a.createdAt;
        const bValue = sortField.value === 'lastLoginAt' ? b.lastLoginAt : b.createdAt;
        // Konten ohne Anmeldung stehen unabhängig von der Richtung am Ende
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        return direction * aValue.localeCompare(bValue);
    });
});

loadUsers();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

function showMessage(text: string, isError = false) {
    message.value = text;
    messageIsError.value = isError;
}

async function loadUsers() {
    pending.value = true;
    try {
        const response = await $fetch<{ users: AdminUserRecord[] }>('/api/admin/users');
        users.value = response.users;
        draftPermissions.value = Object.fromEntries(response.users.map(user => [user.id, [...user.permissions]]));
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Die Nutzer konnten nicht geladen werden.'), true);
    }
    finally {
        pending.value = false;
    }
}

async function createUser() {
    creating.value = true;
    message.value = '';
    try {
        const response = await $fetch<{ user: AdminUserRecord; inviteSent: boolean }>('/api/admin/users', { method: 'POST', body: form });
        form.name = '';
        form.email = '';
        form.permissions = [];
        await loadUsers();
        showMessage(response.inviteSent
            ? 'Das Konto wurde angelegt und eine Einladungs-E-Mail versendet.'
            : 'Das Konto wurde angelegt. Der Mailversand ist deaktiviert – setze das Passwort über „Passwort setzen“.');
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Das Konto konnte nicht angelegt werden.'), true);
    }
    finally {
        creating.value = false;
    }
}

async function deleteUser(user: AdminUserRecord) {
    if (user.id === props.currentUserId) return;
    if (!confirm(`Das Konto von „${user.name}“ wirklich löschen?`)) return;

    deletingId.value = user.id;
    message.value = '';
    try {
        await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
        await loadUsers();
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Das Konto konnte nicht gelöscht werden.'), true);
    }
    finally {
        deletingId.value = null;
    }
}

function isDirty(user: AdminUserRecord) {
    const draft = draftPermissions.value[user.id] ?? [];
    return draft.length !== user.permissions.length || !user.permissions.every(permission => draft.includes(permission));
}

async function savePermissions(user: AdminUserRecord) {
    savingId.value = user.id;
    message.value = '';
    try {
        const response = await $fetch<{ user: AdminUserRecord }>(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            body: { permissions: draftPermissions.value[user.id] ?? [] },
        });

        const index = users.value.findIndex(entry => entry.id === user.id);
        if (index !== -1) users.value[index] = response.user;
        draftPermissions.value[user.id] = [...response.user.permissions];

        if (response.user.id === props.currentUserId && store.adminUser) {
            store.adminUser = { ...store.adminUser, permissions: [...response.user.permissions] };
        }

        showMessage('Die Berechtigungen wurden gespeichert.');
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Die Berechtigungen konnten nicht gespeichert werden.'), true);
    }
    finally {
        savingId.value = null;
    }
}

function applyUpdatedUser(updated: AdminUserRecord) {
    const index = users.value.findIndex(entry => entry.id === updated.id);
    if (index !== -1) users.value[index] = updated;
    draftPermissions.value[updated.id] = [...updated.permissions];
}

function startSetPassword(user: AdminUserRecord) {
    passwordUserId.value = user.id;
    passwordInput.value = '';
}

function closeSetPassword() {
    passwordUserId.value = null;
    passwordInput.value = '';
}

async function savePassword(user: AdminUserRecord) {
    if (passwordInput.value.length < 12) {
        showMessage('Das Passwort muss mindestens 12 Zeichen lang sein.', true);
        return;
    }

    passwordSaving.value = true;
    message.value = '';
    try {
        const response = await $fetch<{ user: AdminUserRecord }>(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            body: { password: passwordInput.value },
        });
        applyUpdatedUser(response.user);
        closeSetPassword();
        showMessage(`Das Passwort für ${user.name} wurde gesetzt.`);
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Das Passwort konnte nicht gesetzt werden.'), true);
    }
    finally {
        passwordSaving.value = false;
    }
}

async function toggleActive(user: AdminUserRecord) {
    if (user.active && !confirm(`Das Konto von „${user.name}“ wirklich deaktivieren? Bestehende Anmeldungen werden beendet.`)) return;

    togglingId.value = user.id;
    message.value = '';
    try {
        const response = await $fetch<{ user: AdminUserRecord }>(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            body: { active: !user.active },
        });
        applyUpdatedUser(response.user);
        showMessage(response.user.active
            ? `Das Konto von ${response.user.name} wurde aktiviert.`
            : `Das Konto von ${response.user.name} wurde deaktiviert.`);
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Das Konto konnte nicht geändert werden.'), true);
    }
    finally {
        togglingId.value = null;
    }
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.users-panel {
    width: min(720px, 100%);
    margin: 0 auto;
    padding: clamp(1rem, 2.5vw, 2rem);

    &_intro {
        p,
        h1 {
            margin: 0;
        }

        p {
            font-size: 0.7rem;
            font-weight: 700;
            color: $secondary300;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        h1 {
            margin-top: 0.25rem;

            font-family: $displayFont;
            font-size: 2.5rem;
            font-weight: 400;
            line-height: 1;
            color: $lightgray0;
            text-transform: uppercase;
        }
    }

    &_message {
        margin: 1rem 0 0;
        padding: 0.75rem;
        border: 1px solid $success400;
        border-radius: 8px;

        color: $success400;

        background: rgb(74 222 128 / 6%);

        &--error {
            border-color: $error500;
            color: $error300;
            background: rgb(194 37 105 / 8%);
        }
    }

    &_section {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid $darkgray800;
        border-radius: 12px;

        background: $darkgray950;

        h2 {
            margin: 0 0 0.85rem;
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }

    &_state {
        padding: 1rem;
        color: $lightgray300;
        text-align: center;
    }
}

.user-list {
    display: grid;
    gap: 0.55rem;
}

.user-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 40px;
    gap: 0.5rem;
    align-items: center;

    padding: 0.7rem 0.85rem;
    border: 1px solid $darkgray800;
    border-radius: 9px;

    background: $darkgray900;

    &_main {
        display: grid;
        gap: 0.15rem;
        min-width: 0;

        strong {
            color: $lightgray50;
            overflow-wrap: anywhere;
        }
    }

    &_email {
        font-size: 0.8rem;
        color: $lightgray200;
        overflow-wrap: anywhere;
    }

    &_meta {
        font-size: 0.72rem;
        color: $secondary300;
    }

    &_permissions {
        display: flex;
        grid-column: 1 / -1;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;

        padding-top: 0.55rem;
        border-top: 1px solid $darkgray800;
    }

    &_permission-select {
        flex: 1;
        min-width: 15rem;
    }

    &_pending {
        display: inline-block;

        margin-left: 0.35rem;
        padding: 0.1rem 0.45rem;
        border: 1px solid $secondary600;
        border-radius: 999px;

        font-size: 0.68rem;
        color: $secondary300;

        &--inactive {
            border-color: $error500;
            color: $error300;
        }
    }

    &--inactive {
        opacity: 0.6;
    }

    &_password {
        display: flex;
        grid-column: 1 / -1;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;

        input {
            flex: 1;

            min-width: 14rem;
            min-height: 38px;
            padding: 0 0.7rem;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            font: inherit;
            font-size: 0.82rem;
            color: $lightgray50;

            background: $darkgray950;
            outline: none;

            &:focus-visible {
                border-color: $primary400;
                outline: 2px solid rgb(221 91 69 / 22%);
            }
        }
    }
}

.row-button {
    cursor: pointer;

    min-height: 34px;
    padding: 0 0.7rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.75rem;
    color: $lightgray200;

    background: transparent;

    &:hover:not(:disabled) {
        border-color: $secondary600;
        color: $secondary300;
    }

    &--danger:hover:not(:disabled) {
        border-color: $error500;
        color: $error300;
    }

    &:disabled {
        cursor: wait;
        opacity: 0.55;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.users-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 0.85rem;

    &_search {
        flex: 1;
        min-width: 14rem;
    }

    &_sort {
        display: flex;
        gap: 0.3rem;
    }

    &_sort-button {
        cursor: pointer;

        display: inline-flex;
        gap: 0.3rem;
        align-items: center;

        min-height: 36px;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 999px;

        font: inherit;
        font-size: 0.78rem;
        color: $lightgray200;

        background: transparent;

        svg {
            width: 0.95rem;
            height: 0.95rem;
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

.new-user-form {
    display: grid;
    gap: 0.75rem;
    max-width: 26rem;

    &_note {
        font-size: 0.72rem;
        line-height: 1.4;
        color: $lightgray400;
    }
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    > span {
        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;
    }

    input {
        min-height: 42px;
        padding: 0.5rem 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    small {
        font-size: 0.72rem;
        line-height: 1.4;
        color: $lightgray400;
    }
}

.icon-button {
    cursor: pointer;

    display: grid;
    place-items: center;

    min-width: 40px;
    min-height: 40px;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    color: $lightgray200;

    background: transparent;

    &:disabled {
        cursor: default;
        opacity: 0.35;
    }

    &--danger:hover:not(:disabled) {
        color: $error300;
        background: rgb(194 37 105 / 8%);
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.save-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 42px;
    margin-top: 0.25rem;
    padding: 0 1rem;
    border: 0;
    border-radius: 8px;

    font: inherit;
    font-weight: 700;
    color: $whiteOrig;

    background: $primary500;

    &:disabled {
        cursor: wait;
        opacity: 0.55;
    }

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }

    &--small {
        min-height: 34px;
        margin-top: 0;
        padding: 0 0.75rem;
        font-size: 0.78rem;
    }
}
</style>
