<template>
    <section class="auth-view">
        <div class="auth-copy">
            <p class="auth-kicker">Programmverwaltung</p>
            <h1>{{ registrationOpen ? 'Den Vorführraum einrichten' : 'Willkommen zurück' }}</h1>
            <p>
                {{ registrationOpen
                    ? 'Lege das erste Administrationskonto an. Danach wird die Registrierung dauerhaft geschlossen.'
                    : 'Melde dich an, um Vorstellungen zu planen, zu gestalten und zu veröffentlichen.' }}
            </p>
            <div class="auth-reel" aria-hidden="true">
                <span v-for="index in 7" :key="index" />
            </div>
        </div>

        <form class="auth-form" @submit.prevent="submitAuth">
            <div class="auth-form_heading">
                <Icon :name="registrationOpen ? 'material-symbols:shield-person-rounded' : 'material-symbols:key-rounded'" aria-hidden="true" />
                <div>
                    <h2>{{ registrationOpen ? 'Erstes Konto' : 'Anmeldung' }}</h2>
                    <p>{{ registrationOpen ? 'Nur einmal möglich' : 'Geschützter Bereich' }}</p>
                </div>
            </div>

            <label v-if="registrationOpen" class="auth-field">
                <span>Name</span>
                <input v-model.trim="authForm.name" required minlength="2" maxlength="80" autocomplete="name">
            </label>
            <label class="auth-field">
                <span>E-Mail-Adresse</span>
                <input v-model.trim="authForm.email" required type="email" maxlength="254" autocomplete="email">
            </label>
            <label class="auth-field">
                <span>Passwort</span>
                <input
                    v-model="authForm.password"
                    required
                    type="password"
                    :minlength="registrationOpen ? 12 : 1"
                    maxlength="128"
                    :autocomplete="registrationOpen ? 'new-password' : 'current-password'"
                >
                <small v-if="registrationOpen">Mindestens 12 Zeichen. Verwende ein einzigartiges Passwort.</small>
            </label>

            <p v-if="authError" class="auth-error" role="alert">{{ authError }}</p>

            <button class="auth-submit" type="submit" :disabled="authPending">
                <Icon :name="authPending ? 'material-symbols:progress-activity' : 'material-symbols:arrow-forward-rounded'" aria-hidden="true" />
                {{ authPending ? 'Bitte warten …' : registrationOpen ? 'Administration einrichten' : 'Anmelden' }}
            </button>
        </form>
    </section>
</template>

<script setup lang="ts">
import type { AdminUser } from '~~/types/user';

const props = defineProps<{
    registrationOpen: boolean;
}>();

const emit = defineEmits<{
    authenticated: [user: AdminUser];
}>();

interface ApiError {
    data?: { statusMessage?: string };
}

const authPending = ref(false);
const authError = ref('');
const authForm = reactive({ name: '', email: '', password: '' });

async function submitAuth() {
    authPending.value = true;
    authError.value = '';
    try {
        const endpoint = props.registrationOpen ? '/api/auth/register' : '/api/auth/login';
        const response = await $fetch<{ user: AdminUser }>(endpoint, {
            method: 'POST',
            body: props.registrationOpen ? authForm : { email: authForm.email, password: authForm.password },
        });
        authForm.password = '';
        emit('authenticated', response.user);
    }
    catch (error: unknown) {
        authError.value = (error as ApiError).data?.statusMessage ?? 'Die Anmeldung ist fehlgeschlagen.';
    }
    finally {
        authPending.value = false;
    }
}
</script>

<style scoped lang="scss">
.auth-view {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: clamp(2rem, 6vw, 6rem);
    align-items: center;

    width: min(1040px, calc(100% - 3rem));
    min-height: calc(100dvh - 64px);
    margin: 0 auto;
    padding: 3rem 0;
}

.auth-copy {
    h1 {
        max-width: 12ch;
        margin: 0.6rem 0 0;

        font-family: $displayFont;
        font-size: clamp(3.4rem, 8vw, 6rem);
        font-weight: 400;
        line-height: 0.9;
        color: $lightgray0;
        text-transform: uppercase;
        text-wrap: balance;
    }

    > p:not(.auth-kicker) {
        max-width: 54ch;
        margin: 1.25rem 0 0;
        line-height: 1.65;
        color: $lightgray200;
    }
}

.auth-kicker {
    margin: 0;

    font-size: 0.7rem;
    font-weight: 700;
    color: $secondary300;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.auth-reel {
    display: flex;
    gap: 0.65rem;
    margin-top: 2rem;

    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        background: $secondary500;
        box-shadow: 0 0 7px rgb(192 143 46 / 62%);
    }
}

.auth-form {
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid $darkgray700;
    border-radius: 14px;
    background: $darkgray900;

    &_heading {
        display: flex;
        gap: 0.85rem;
        align-items: center;
        margin-bottom: 1.5rem;

        > svg {
            width: 2rem;
            height: 2rem;
            color: $secondary300;
        }

        h2,
        p {
            margin: 0;
        }

        h2 {
            color: $lightgray0;
        }

        p {
            margin-top: 0.2rem;
            font-size: 0.75rem;
            color: $lightgray300;
        }
    }
}

.auth-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    margin-top: 1rem;

    > span {
        font-size: 0.75rem;
        font-weight: 700;
        color: $lightgray200;
    }

    input {
        min-height: 48px;
        padding: 0 0.85rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        color: $lightgray50;

        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    small {
        line-height: 1.4;
        color: $lightgray300;
    }
}

.auth-error {
    margin: 1rem 0 0;
    padding: 0.75rem;
    border: 1px solid $error500;
    border-radius: 8px;

    color: $error300;

    background: rgb(194 37 105 / 8%);
}

.auth-submit {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 48px;
    margin-top: 1.25rem;
    padding: 0 1rem;
    border: 0;
    border-radius: 6px;

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

@include mobileOnly {
    .auth-view {
        grid-template-columns: 1fr;
        width: calc(100% - 2rem);
        padding: 2rem 0;
    }

    .auth-copy h1 {
        font-size: clamp(3rem, 15vw, 4.7rem);
    }
}
</style>
