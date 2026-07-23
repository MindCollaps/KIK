1<template>
    <ThemePageSwitcher v-if="!route.params.id" theme="programm" slug="programm">
        <common-info-hero
            eyebrow="Kino im Kasten"
            title="Programm"
            :description="pageDescription"
        >
            <div class="hero-actions">
                <common-button to="/sommerkino" type="secondary-black">Sommerkino ansehen</common-button>
                <common-button to="/mitmachen" type="secondary">Mitmachen</common-button>
            </div>
        </common-info-hero>

        <section v-if="status === 'pending'" class="program-state" aria-label="Programm wird geladen">
            <ui-shell size="info" class="program-skeletons">
                <div v-for="index in 3" :key="index" class="program-skeleton" />
            </ui-shell>
        </section>

        <section v-else-if="error" class="program-state">
            <ui-shell size="info" class="program-message">
                <Icon name="material-symbols:signal-disconnected-rounded" aria-hidden="true" />
                <div>
                    <h2>Das Programm konnte nicht geladen werden</h2>
                    <p>Bitte versuche es noch einmal. Deine Verbindung oder unser Server hat gerade eine Pause eingelegt.</p>
                </div>
                <ui-button type="secondary" @click="refresh()">Erneut versuchen</ui-button>
            </ui-shell>
        </section>

        <template v-else-if="programGroups.length">
            <section v-for="group in programGroups" :key="group.month" class="program-month">
                <ui-shell size="info">
                    <header class="program-month_header">
                        <ui-section-title tag="h2">{{ group.month }}</ui-section-title>
                        <span>{{ group.entries.length }} {{ group.entries.length === 1 ? 'Vorstellung' : 'Vorstellungen' }}</span>
                    </header>
                    <div class="program-list">
                        <program-card
                            v-for="entry in group.entries"
                            :key="entry.id"
                            :entry="entry"
                            variant="list"
                        />
                    </div>
                </ui-shell>
            </section>
        </template>

        <section v-else class="program-state">
            <ui-shell size="info" class="program-message">
                <Icon name="material-symbols:movie-off-rounded" aria-hidden="true" />
                <div>
                    <h2>Das nächste Programm ist in Arbeit</h2>
                    <p>Neue Termine erscheinen hier, sobald unsere Auswahl steht. Bis dahin lohnt sich ein Blick aufs Sommerkino.</p>
                </div>
                <ui-button to="/sommerkino">Zum Sommerkino</ui-button>
            </ui-shell>
        </section>

        <common-info-section title="Hinweise vor dem Besuch">
            <ul class="hint-list">
                <li>Einlass startet in der Regel 30 Minuten vor Filmbeginn.</li>
                <li>Barrierearme Plätze sind verfügbar. Schreib uns vorher kurz eine Mail.</li>
                <li>
                    Verknüpfte Vorstellungen zeigen Community-Inhaltshinweise von
                    <a href="https://www.doesthedogdie.com/" target="_blank" rel="noreferrer noopener">DoesTheDogDie</a>.
                </li>
            </ul>
        </common-info-section>
    </ThemePageSwitcher>
    <NuxtPage v-else />
</template>

<script setup lang="ts">
import type { ProgramEntry } from '~~/types/program';
import { formatProgramMonth } from '~/composables/program';
import ThemePageSwitcher from '~/components/theme/ThemePageSwitcher.vue';
import { usePageSeo } from '~/composables/seo';

definePageMeta({
    layout: 'default',
});

const pageDescription = 'Das aktuelle Programm mit Uhrzeit, Ort und Sprache. Du musst nicht an der TU studieren, um vorbeizukommen.';

const route = useRoute();
const { data, status, error, refresh } = await useFetch<{ entries: ProgramEntry[] }>('/api/program');

usePageSeo(() => ({
    title: 'Programm',
    description: pageDescription,
}));

const programGroups = computed(() => {
    const groups = new Map<string, ProgramEntry[]>();
    for (const entry of data.value?.entries ?? []) {
        const month = formatProgramMonth(entry.startsAt);
        groups.set(month, [...(groups.get(month) ?? []), entry]);
    }
    return Array.from(groups, ([month, entries]) => ({ month, entries }));
});
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}

.program-list {
    display: grid;
    gap: 1rem;
    margin-top: 1.25rem;

    :deep(.program-card) {
        animation: program-card-ignite 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @for $i from 1 through 6 {
        :deep(.program-card:nth-child(#{$i})) {
            animation-delay: #{($i - 1) * 45}ms;
        }
    }

    :deep(.program-card:nth-child(n+7)) {
        animation-delay: 225ms;
    }
}

@keyframes program-card-ignite {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.program-month {
    margin-top: clamp(2rem, 4.5vw, 4rem);

    &_header {
        display: flex;
        gap: 1rem;
        align-items: end;
        justify-content: space-between;

        span {
            padding-bottom: 0.35rem;
            font-size: 0.75rem;
            color: $secondary300;
        }
    }
}

.program-state {
    margin-top: 2rem;
}

.program-skeletons {
    display: grid;
    gap: 1rem;
}

.program-skeleton {
    min-height: 220px;
    border: 1px solid $darkgray800;
    border-radius: 14px;

    background: linear-gradient(100deg, $darkgray900 20%, $darkgray875 42%, $darkgray900 64%);
    background-size: 240% 100%;

    animation: program-loading 1.4s ease-in-out infinite;
}

.program-message {
    display: flex;
    gap: 1rem;
    align-items: center;

    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid $darkgray800;
    border-radius: 14px;

    background: $darkgray900;

    > svg {
        flex: 0 0 auto;
        width: 2rem;
        height: 2rem;
        color: $secondary300;
    }

    div {
        flex: 1;
    }

    h2,
    p {
        margin: 0;
    }

    h2 {
        font-size: 1.15rem;
        color: $lightgray0;
    }

    p {
        max-width: 62ch;
        margin-top: 0.35rem;
        line-height: 1.55;
        color: $lightgray200;
    }
}

.hint-list {
    margin: 0;
    padding-left: 18px;
    list-style: none;

    li {
        position: relative;

        &::before {
            content: '';

            position: absolute;
            top: 0.65em;
            left: -16px;

            width: 6px;
            height: 6px;
            border-radius: 50%;

            background: $secondary400;
        }

        & + li {
            margin-top: 8px;
        }
    }
}

@include mobileOnly {
    .hero-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .program-month_header,
    .program-message {
        flex-direction: column;
        align-items: flex-start;
    }
}

@keyframes program-loading {
    from {
        background-position: 100% 0;
    }

    to {
        background-position: -100% 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .program-skeleton {
        animation: none;
    }

    .program-list :deep(.program-card) {
        animation: none;
    }
}
</style>
