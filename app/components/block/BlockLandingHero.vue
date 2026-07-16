<template>
    <section class="block-landing-hero">
        <ui-shell size="wide" class="block-landing-hero_inner" :class="{ 'block-landing-hero_inner--single': !block.showNextScreening }">
            <div class="block-landing-hero_copy">
                <ui-eyebrow>{{ block.eyebrow }}</ui-eyebrow>
                <ui-section-title size="hero" tag="h1" class="block-landing-hero_title">
                    {{ block.title }}
                </ui-section-title>
                <p v-if="block.lead" class="block-landing-hero_lead">{{ block.lead }}</p>
                <div v-if="block.actions.length" class="block-landing-hero_actions">
                    <block-action-link
                        v-for="(action, index) in block.actions"
                        :key="index"
                        :action="action"
                    />
                </div>
            </div>

            <template v-if="block.showNextScreening">
                <program-card
                    v-if="primaryScreening"
                    :entry="primaryScreening"
                    variant="feature"
                />
                <div v-else-if="programPending" class="next-screening next-screening--loading" aria-label="Programm wird geladen" />
                <article v-else class="next-screening next-screening--empty">
                    <Icon :name="programError ? 'material-symbols:signal-disconnected-rounded' : 'material-symbols:movie-off-rounded'" aria-hidden="true" />
                    <h2>{{ programError ? 'Programm nicht erreichbar' : 'Neue Termine folgen' }}</h2>
                    <p>{{ programError ? 'Bitte versuche es gleich noch einmal.' : 'Unsere nächste Filmreihe ist bereits in Arbeit.' }}</p>
                    <ui-button v-if="programError" type="secondary" @click="$emit('retry')">Erneut versuchen</ui-button>
                </article>
            </template>
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { LandingHeroBlock } from '~~/types/content';
import type { ProgramEntry } from '~~/types/program';

const props = defineProps<{
    block: LandingHeroBlock;
    entries: ProgramEntry[];
    programPending: boolean;
    programError: boolean;
}>();

defineEmits<{
    retry: [];
}>();

const primaryScreening = computed(() => props.entries[0] ?? null);
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.block-landing-hero {
    isolation: isolate;
    position: relative;
    padding-top: clamp(1.75rem, 3.3vw, 3.125rem);

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

    &_inner {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        gap: clamp(1.25rem, 3.1vw, 2.75rem);
        align-items: start;

        &--single {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    &_title {
        margin-top: 0.5rem;
        font-size: clamp(3rem, 6vw, 5rem);
        text-wrap: balance;
        overflow-wrap: anywhere;
    }

    &_lead {
        max-width: 48ch;
        margin: 1rem 0 0;

        font-size: 0.95rem;
        line-height: 1.7;
        color: $lightgray125;
        text-wrap: pretty;
    }

    &_actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }
}

.next-screening {
    position: relative;

    min-width: 0;
    padding: clamp(1rem, 2.4vw, 1.75rem);
    border: 1px solid $darkgray700;
    border-radius: 16px;

    background:
        linear-gradient(180deg, rgb(36 30 26 / 94%) 0%, rgb(29 24 21 / 90%) 100%),
        $darkgray875;

    &--empty {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;

        > svg {
            width: 2rem;
            height: 2rem;
            color: $secondary300;
        }

        h2 {
            margin: 1rem 0 0;
            color: $lightgray0;
        }

        p {
            margin: 0.5rem 0 1rem;
            line-height: 1.6;
            color: $lightgray150;
        }
    }

    &--loading {
        min-height: 340px;
        background: linear-gradient(100deg, $darkgray900 20%, $darkgray875 42%, $darkgray900 64%);
        background-size: 240% 100%;
        animation: block-hero-loading 1.4s ease-in-out infinite;
    }
}

@media all and (max-width: 900px) {
    .block-landing-hero_inner {
        grid-template-columns: 1fr;
    }
}

@include mobileOnly {
    .block-landing-hero_title {
        font-size: 2.5rem;
    }
}

@media (prefers-reduced-motion: no-preference) {
    .block-landing-hero_copy,
    .next-screening {
        animation: block-hero-reveal 420ms ease-out both;
    }

    .next-screening {
        animation-delay: 90ms;
    }
}

@keyframes block-hero-reveal {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes block-hero-loading {
    from {
        background-position: 100% 0;
    }

    to {
        background-position: -100% 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .next-screening--loading {
        animation: none;
    }
}
</style>
