<template>
    <article
        class="program-card"
        :class="[
            `program-card--${ variant }`,
            `program-card--style-${ entry.style.toLowerCase() }`,
            {
                'program-card--with-image': entry.film.imagePath,
                'program-card--framed': entry.style === 'CUSTOM' && entry.customCardBorder,
            },
        ]"
        :style="cardStyle"
        role="link"
        tabindex="0"
        :aria-label="`${entry.film.title} vollständig anzeigen`"
        @click="openDetails"
        @keydown.enter="openDetails"
    >
        <span
            v-if="badgeMeta"
            class="program-card_badge"
            :class="{ 'program-card_badge--borderless': !badgeMeta.withBorder }"
        >
            <Icon :name="badgeMeta.icon" aria-hidden="true" />
            {{ badgeMeta.label }}
        </span>

        <div v-if="entry.film.imagePath" class="program-card_media">
            <img
                :src="entry.film.imagePath"
                :alt="entry.film.imageAlt || `Szenenbild zu ${entry.film.title}`"
                loading="lazy"
            >
            <div class="program-card_media-shade" aria-hidden="true" />
        </div>

        <div class="program-card_body">
            <p class="program-card_date">
                <Icon name="material-symbols:calendar-month-rounded" aria-hidden="true" />
                {{ formatProgramDate(entry.startsAt) }}
            </p>

            <h2 v-if="variant === 'feature'" class="program-card_title">{{ entry.film.title }}</h2>
            <h3 v-else class="program-card_title">{{ entry.film.title }}</h3>

            <p class="program-card_description">{{ entry.film.description }}</p>

            <div v-if="confirmedWarnings.length" class="program-card_warnings">
                <span class="program-card_warnings-label">
                    <Icon name="material-symbols:warning-rounded" aria-hidden="true" />
                    {{ confirmedWarnings.length }} {{ confirmedWarnings.length === 1 ? 'Inhaltshinweis' : 'Inhaltshinweise' }}
                </span>
                <span class="program-card_warnings-topics">
                    {{ warningPreview }}
                </span>
            </div>

            <dl class="program-card_facts">
                <div v-if="entry.venue">
                    <dt><Icon name="material-symbols:location-on-rounded" aria-hidden="true" /><span>Ort</span></dt>
                    <dd>{{ entry.venue }}</dd>
                </div>
                <div v-if="entry.language">
                    <dt><Icon name="material-symbols:subtitles-rounded" aria-hidden="true" /><span>Fassung</span></dt>
                    <dd>{{ entry.language }}</dd>
                </div>
                <div v-if="entry.film.runtimeMinutes">
                    <dt><Icon name="material-symbols:schedule-rounded" aria-hidden="true" /><span>Laufzeit</span></dt>
                    <dd>{{ entry.film.runtimeMinutes }} Min.</dd>
                </div>
                <div v-if="entry.film.ageRating">
                    <dt><Icon name="material-symbols:family-link-rounded" aria-hidden="true" /><span>Freigabe</span></dt>
                    <dd>{{ entry.film.ageRating }}</dd>
                </div>
            </dl>

            <div class="program-card_footer">
                <p class="program-card_price">{{ formatProgramPrice(entry) }}</p>
                <span class="program-card_link" aria-hidden="true">
                    Details
                    <Icon name="material-symbols:arrow-forward-rounded" aria-hidden="true" />
                </span>
            </div>

            <p v-if="credits" class="program-card_credits">{{ credits }}</p>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { ProgramEntry } from '~~/types/program';
import { formatProgramDate, formatProgramPrice } from '~/composables/program';

const props = withDefaults(defineProps<{
    entry: ProgramEntry;
    variant?: 'feature' | 'grid' | 'list';
}>(), {
    variant: 'grid',
});

const cardStyle = computed<CSSProperties>(() => ({
    '--program-highlight': props.entry.highlightColor ?? '#D7AC5C',
}));

const credits = computed(() => {
    const origin = [props.entry.film.country, props.entry.film.releaseYear].filter(Boolean).join(' ');
    return [props.entry.film.director ? `Regie: ${props.entry.film.director}` : '', origin].filter(Boolean).join(' · ');
});

const confirmedWarnings = computed(() => (props.entry.film.contentWarnings?.stats ?? [])
    .filter(stat => stat.yesSum > stat.noSum)
    .sort((left, right) => right.yesSum - left.yesSum));

const warningPreview = computed(() => {
    const names = confirmedWarnings.value.slice(0, 2).map(stat => stat.topicName);
    const remaining = confirmedWarnings.value.length - names.length;
    return `${names.join(' · ')}${remaining > 0 ? ` · +${remaining}` : ''}`;
});

const badgeMeta = computed<null | { icon: string; label: string; withBorder: boolean }>(() => {
    if (props.entry.style === 'DEFAULT') return null;
    if (props.entry.style === 'SPECIAL') {
        return {
            icon: 'material-symbols:stars-rounded',
            label: 'Sondervorstellung',
            withBorder: true,
        };
    }
    if (props.entry.style === 'HIGHLIGHTED') {
        return {
            icon: 'material-symbols:hotel-class-rounded',
            label: 'Empfehlung',
            withBorder: true,
        };
    }
    return {
        icon: props.entry.customBadgeIcon || 'material-symbols:label-rounded',
        label: props.entry.customBadgeText || 'Custom',
        withBorder: props.entry.customBadgeBorder,
    };
});

function openDetails(event: MouseEvent | KeyboardEvent) {
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    navigateTo(`/programm/${props.entry.id}`);
}
</script>

<style scoped lang="scss">
.program-card {
    --program-highlight: #{$secondary400};
    cursor: pointer;

    isolation: isolate;
    position: relative;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    min-width: 0;
    border: 1px solid $darkgray800;
    border-radius: 14px;

    background: $darkgray900;

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }

    &_media {
        position: relative;
        overflow: hidden;
        aspect-ratio: 16 / 7;
        background: $darkgray875;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &_media-shade {
        position: absolute;
        inset: auto 0 0;
        height: 45%;
        background: linear-gradient(to bottom, transparent, rgb(15 12 10 / 72%));
    }

    &_body {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding: clamp(1rem, 2.4vw, 1.5rem);
    }

    &_date {
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;

        margin: 0;

        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.35;
        color: $secondary300;
        text-transform: uppercase;
        letter-spacing: 0.06em;

        svg {
            width: 1rem;
            height: 1rem;
        }
    }

    &_badge {
        position: absolute;
        z-index: 2;
        top: 0.75rem;
        right: 0.75rem;

        display: inline-flex;
        gap: 0.3rem;
        align-items: center;

        padding: 0.3rem 0.55rem;
        border: 1px solid color-mix(in srgb, var(--program-highlight) 60%, $darkgray800);
        border-radius: 999px;

        font-size: 0.65rem;
        font-weight: 700;
        color: var(--program-highlight);
        text-transform: uppercase;
        letter-spacing: 0.07em;

        background: color-mix(in srgb, $darkgray900 82%, transparent);
        backdrop-filter: blur(6px);

        svg {
            width: 0.85rem;
            height: 0.85rem;
        }

        &--borderless {
            padding-inline: 0.55rem;
            border-color: transparent;
        }
    }

    &_title {
        margin: 0.8rem 0 0;

        font-family: $displayFont;
        font-size: clamp(2rem, 4vw, 3.25rem);
        font-weight: 400;
        line-height: 0.98;
        color: $lightgray0;
        text-transform: uppercase;
        text-wrap: balance;
        letter-spacing: 0.02em;
        overflow-wrap: anywhere;
    }

    &_description {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;

        max-width: 68ch;
        margin: 0.9rem 0 0;

        line-height: 1.65;
        color: $lightgray150;
        text-wrap: pretty;
    }

    &_facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.85rem 1.4rem;
        margin: 1rem 0 0;

        div {
            min-width: 0;
        }

        dt {
            display: flex;
            gap: 0.3rem;
            align-items: center;

            font-size: 0.65rem;
            color: $lightgray300;
            text-transform: uppercase;
            letter-spacing: 0.08em;

            svg {
                width: 0.9rem;
                height: 0.9rem;
            }
        }

        dd {
            margin: 0.2rem 0 0;
            font-size: 0.85rem;
            font-weight: 650;
            color: $lightgray100;
        }
    }

    &_warnings {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.65rem;
        align-items: center;

        margin-top: 0.9rem;
        padding: 0.55rem 0.7rem;
        border: 1px solid rgb(215 172 92 / 26%);
        border-radius: 7px;

        background: rgb(215 172 92 / 6%);
    }

    &_warnings-label {
        display: inline-flex;
        gap: 0.3rem;
        align-items: center;

        font-size: 0.72rem;
        font-weight: 700;
        color: $secondary300;

        svg {
            width: 1rem;
            height: 1rem;
        }
    }

    &_warnings-topics {
        min-width: 0;
        font-size: 0.7rem;
        color: $lightgray200;
        overflow-wrap: anywhere;
    }

    &_footer {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1.5rem;
        align-items: center;
        justify-content: space-between;

        margin-top: auto;
        padding-top: 1.25rem;
    }

    &_price {
        margin: 0;
        font-size: 1rem;
        font-weight: 750;
        color: $secondary300;
    }

    &_link {
        display: inline-flex;
        gap: 0.35rem;
        align-items: center;

        min-height: 44px;

        font-weight: 700;
        color: $lightgray100;
        text-underline-offset: 0.2em;

        svg {
            width: 1rem;
            height: 1rem;
        }

        &:focus-visible {
            border-radius: 2px;
            outline: 2px solid $primary400;
            outline-offset: 3px;
        }
    }

    &_credits {
        margin: 0.75rem 0 0;
        font-size: 0.75rem;
        color: $lightgray300;
    }

    &--feature {
        min-height: 100%;
        border-color: $darkgray700;

        .program-card_title {
            font-size: clamp(2.5rem, 5vw, 4rem);
        }

        .program-card_description {
            -webkit-line-clamp: 5;
        }
    }

    &--list {
        display: grid;
        grid-template-columns: minmax(0, 1fr);

        &.program-card--with-image {
            grid-template-columns: minmax(220px, 0.38fr) minmax(0, 1fr);
        }

        .program-card_media {
            aspect-ratio: auto;
            height: 100%;
        }
    }

    &--style-special {
        background:
            radial-gradient(circle at 9% 8%, rgb(215 172 92 / 12%) 0%, transparent 36%),
            $darkgray875;

        &::after {
            pointer-events: none;
            content: '';

            position: absolute;
            z-index: -1;
            inset: 0;

            opacity: 0.35;
            background-image: radial-gradient(rgb(232 203 146 / 13%) 1px, transparent 1.4px);
            background-size: 8px 8px;

            mask-image: linear-gradient(135deg, black, transparent 64%);
        }

        &::before {
            pointer-events: none;
            content: '';

            position: absolute;
            z-index: -1;
            top: 0.65rem;
            right: 0.65rem;
            bottom: 0.65rem;

            width: 8px;

            opacity: 0.38;
            background: repeating-linear-gradient(to bottom, $secondary300 0 5px, transparent 5px 11px);
        }
    }

    &--style-highlighted {
        border-color: color-mix(in srgb, var(--program-highlight) 72%, $darkgray800);
        background:
            linear-gradient(145deg, color-mix(in srgb, var(--program-highlight) 16%, transparent), transparent 48%),
            $darkgray900;

        .program-card_date,
        .program-card_price {
            color: var(--program-highlight);
        }
    }

    &--framed {
        border-color: color-mix(in srgb, var(--program-highlight) 60%, $darkgray800);
    }
}

@include mobileOnly {
    .program-card {
        &--list.program-card--with-image {
            grid-template-columns: 1fr;
        }

        &--list .program-card_media {
            aspect-ratio: 16 / 8;
        }

        &_facts {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
}
</style>