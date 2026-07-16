<template>
    <section class="block-program-overview">
        <ui-shell size="wide">
            <div class="block-program-overview_head">
                <ui-section-title tag="h2">{{ block.title }}</ui-section-title>
                <block-action-link
                    v-if="block.linkLabel && block.linkTo"
                    :action="{ label: block.linkLabel, to: block.linkTo, style: 'secondary' }"
                />
            </div>

            <div v-if="screenings.length" class="block-program-overview_grid">
                <program-card
                    v-for="entry in screenings"
                    :key="entry.id"
                    :entry="entry"
                    variant="grid"
                />
            </div>
            <div v-else class="block-program-overview_empty" role="status" aria-live="polite">
                <Icon name="material-symbols:nightlife-rounded" aria-hidden="true" />
                <div>
                    <h3>{{ emptyTitle }}</h3>
                    <p>{{ emptyDescription }}</p>
                    <div class="block-program-overview_empty-actions">
                        <ui-button type="secondary" to="/programm">Programm ansehen</ui-button>
                        <ui-button
                            v-if="hasVenueFilter"
                            type="secondary"
                            href="https://www.instagram.com/kinoimkasten/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Updates auf Instagram
                        </ui-button>
                    </div>
                </div>
            </div>
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { ProgramOverviewBlock } from '~~/types/content';
import type { ProgramEntry } from '~~/types/program';

const props = defineProps<{
    block: ProgramOverviewBlock;
    entries: ProgramEntry[];
}>();

const matchingEntries = computed(() => {
    const venueFilter = props.block.venueFilter?.trim().toLocaleLowerCase('de') ?? '';
    if (!venueFilter) return props.entries;
    return props.entries.filter(entry => entry.venue?.toLocaleLowerCase('de').includes(venueFilter));
});

const screenings = computed(() => matchingEntries.value.slice(props.block.offset, props.block.offset + props.block.limit));
const hasVenueFilter = computed(() => !!props.block.venueFilter?.trim());
const emptyTitle = computed(() => hasVenueFilter.value ? 'Neue Open-Air-Termine folgen' : 'Neue Termine folgen');
const emptyDescription = computed(() => hasVenueFilter.value
    ? 'Die Auswahl fuers Sommerkino wird aktuell kuratiert. Bis die neuen Open-Air-Termine feststehen, findest du alle laufenden Vorstellungen im regulaeren Programm.'
    : 'Das naechste Programm ist bereits in Arbeit und erscheint hier, sobald es feststeht.');
</script>

<style scoped lang="scss">
.block-program-overview {
    margin-top: clamp(2.2rem, 4.4vw, 4.4rem);

    &_head {
        display: flex;
        gap: 1.25rem;
        align-items: center;
        justify-content: space-between;
    }

    &_grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
        margin-top: 1.15rem;

        > :only-child {
            grid-column: 1 / -1;
        }
    }

    &_empty {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;

        margin-top: 1.15rem;
        padding: 1rem;
        border: 1px solid $darkgray800;
        border-radius: 10px;

        background:
            radial-gradient(circle at 6% 12%, rgb(215 172 92 / 14%) 0%, transparent 36%),
            linear-gradient(180deg, rgb(36 30 26 / 86%) 0%, rgb(29 24 21 / 92%) 100%);

        > svg {
            flex: 0 0 auto;
            width: 1.5rem;
            height: 1.5rem;
            color: $secondary300;
        }

        h3,
        p {
            margin: 0;
        }

        h3 {
            color: $lightgray0;
        }

        p {
            max-width: 62ch;
            margin-top: 0.25rem;

            line-height: 1.55;
            color: $lightgray200;
            text-wrap: pretty;
        }

        &-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            margin-top: 0.8rem;
        }
    }
}

@include mobile {
    .block-program-overview_head {
        flex-direction: column;
        align-items: flex-start;
    }

    .block-program-overview_grid {
        grid-template-columns: 1fr;
    }

    .block-program-overview_empty-actions {
        flex-direction: column;
    }
}
</style>
