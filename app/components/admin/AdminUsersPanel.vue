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
            <div v-if="pending" class="users-panel_state">Nutzer werden geladen …</div>
            <div v-else class="user-list">
                <article v-for="user in users" :key="user.id" class="user-row">
                    <div class="user-row_main">
                        <strong>{{ user.name }}</strong>
                        <span class="user-row_email">{{ user.email }}</span>
                        <span class="user-row_meta">
                            Seit {{ formatDate(user.createdAt) }}
                            <template v-if="user.id === currentUserId"> · Dein Konto</template>
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
                <label class="field">
                    <span>Passwort</span>
                    <input v-model="form.password" required type="password" minlength="12" maxlength="128" autocomplete="new-password">
                    <small>Mindestens 12 Zeichen. Verwende ein einzigartiges Passwort.</small>
                </label>
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

const props = defineProps<{
    currentUserId: string;
}>();

interface ApiError {
    data?: { statusMessage?: string };
}

const users = ref<AdminUserRecord[]>([]);
const pending = ref(false);
const creating = ref(false);
const deletingId = ref<string | null>(null);
const message = ref('');
const messageIsError = ref(false);
const form = reactive({ name: '', email: '', password: '' });

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
        await $fetch('/api/admin/users', { method: 'POST', body: form });
        form.name = '';
        form.email = '';
        form.password = '';
        await loadUsers();
        showMessage('Das Konto wurde angelegt.');
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

function formatDate(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
}

.new-user-form {
    display: grid;
    gap: 0.75rem;
    max-width: 26rem;
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
}
</style>
