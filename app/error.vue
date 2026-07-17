<template>
    <main class="error-page">
        <div class="error-card">
            <NuxtLink class="error-card_brand" to="/" @click.prevent="goHome">
                <svg fill="none" viewBox="0 0 32 32" aria-hidden="true">
                    <rect height="27" rx="7" stroke="currentColor" stroke-width="2.4" width="27" x="2.5" y="2.5" />
                    <path d="M13 11.5L21.5 16L13 20.5V11.5Z" fill="currentColor" />
                </svg>
                <span>Kino im Kasten</span>
            </NuxtLink>

            <p class="error-card_code" aria-hidden="true">{{ error.statusCode }}</p>
            <h1>{{ heading }}</h1>
            <p class="error-card_message">{{ message }}</p>

            <div class="error-card_reel" aria-hidden="true">
                <span v-for="index in 7" :key="index" />
            </div>

            <div class="error-card_actions">
                <button type="button" class="error-button error-button--primary" @click="goHome">
                    <Icon name="material-symbols:other-houses" aria-hidden="true" />
                    Zur Startseite
                </button>
                <button v-if="!isNotFound" type="button" class="error-button" @click="reload">
                    <Icon name="material-symbols:refresh-rounded" aria-hidden="true" />
                    Erneut versuchen
                </button>
                <NuxtLink v-else class="error-button" to="/programm" @click.prevent="goToProgram">
                    <Icon name="material-symbols:calendar-month-rounded" aria-hidden="true" />
                    Zum Programm
                </NuxtLink>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
    error: NuxtError;
}>();

const isNotFound = computed(() => props.error.statusCode === 404);

const heading = computed(() => isNotFound.value
    ? 'Diese Vorstellung gibt es nicht'
    : 'Da ist der Film gerissen');

const message = computed(() => isNotFound.value
    ? 'Die aufgerufene Seite existiert nicht oder wurde verschoben. Vielleicht findest du im Programm, wonach du suchst.'
    : 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es gleich noch einmal.');

useHead(() => ({
    title: `${props.error.statusCode} · Kino im Kasten`,
    meta: [
        { key: 'robots', name: 'robots', content: 'noindex, nofollow' },
    ],
}));

function goHome() {
    clearError({ redirect: '/' });
}

function goToProgram() {
    clearError({ redirect: '/programm' });
}

function reload() {
    if (import.meta.client) window.location.reload();
}
</script>

<style scoped lang="scss">
.error-page {
    isolation: isolate;
    position: relative;

    display: grid;
    place-items: center;

    min-height: 100dvh;
    padding: 1.5rem;

    color: $lightgray150;

    background:
        radial-gradient(circle at 8% -4%, rgb(196 48 31 / 20%) 0%, transparent 38%),
        radial-gradient(circle at 94% 6%, rgb(215 172 92 / 12%) 0%, transparent 28%),
        $darkgray1000;

    &::before {
        pointer-events: none;
        content: '';

        position: absolute;
        z-index: -1;
        inset: 0;

        opacity: 0.58;
        background-image: radial-gradient(rgb(244 240 234 / 12%) 1px, transparent 1.4px);
        background-size: 7px 7px;

        mask-image: linear-gradient(to bottom, black 0%, rgb(0 0 0 / 88%) 42%, transparent 100%);
    }
}

.error-card {
    max-width: 34rem;
    text-align: center;

    &_brand {
        display: inline-flex;
        gap: 0.65rem;
        align-items: center;

        font-family: $displayFont;
        font-size: 1.35rem;
        color: $lightgray0;
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: 0.03em;

        svg {
            width: 1.8rem;
            height: 1.8rem;
            color: $primary500;
        }

        &:focus-visible {
            border-radius: 2px;
            outline: 2px solid $primary400;
            outline-offset: 3px;
        }
    }

    &_code {
        margin: 1.5rem 0 0;

        font-family: $displayFont;
        font-size: clamp(6rem, 22vw, 11rem);
        font-weight: 400;
        line-height: 0.85;
        color: $primary500;
    }

    h1 {
        margin: 1rem 0 0;

        font-family: $displayFont;
        font-size: clamp(1.9rem, 6vw, 3rem);
        font-weight: 400;
        line-height: 1;
        color: $lightgray0;
        text-transform: uppercase;
        text-wrap: balance;
    }

    &_message {
        max-width: 44ch;
        margin: 1rem auto 0;

        line-height: 1.65;
        color: $lightgray200;
        text-wrap: pretty;
    }

    &_reel {
        display: flex;
        gap: 0.65rem;
        justify-content: center;
        margin-top: 1.75rem;

        span {
            width: 8px;
            height: 8px;
            border-radius: 50%;

            background: $secondary500;
            box-shadow: 0 0 7px rgb(192 143 46 / 62%);
        }
    }

    &_actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;

        margin-top: 1.75rem;
    }
}

.error-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 46px;
    padding: 0 1.15rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-weight: 700;
    color: $lightgray100;
    text-decoration: none;

    background: transparent;

    svg {
        width: 1.15rem;
        height: 1.15rem;
    }

    &--primary {
        border-color: $primary500;
        color: $whiteOrig;
        background: $primary500;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }

    &:hover:not(.error-button--primary) {
        border-color: $secondary600;
        color: $secondary300;
    }
}

@media (prefers-reduced-motion: no-preference) {
    .error-card {
        animation: error-reveal 420ms ease-out both;
    }

    @keyframes error-reveal {
        from {
            transform: translateY(10px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
}
</style>
