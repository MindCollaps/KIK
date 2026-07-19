<template>
    <ThemePageSwitcher theme="programm" slug="programm-detail">
        <main class="program-detail">
        <common-info-hero
            eyebrow="Programm"
            :title="entry?.film.title ?? 'Vorstellung'"
            :description="entry ? formatProgramDate(entry.startsAt) : undefined"
        >
            <NuxtLink class="back-link" to="/programm">
                <Icon name="material-symbols:arrow-back-rounded" aria-hidden="true" />
                Zurück zum Programm
            </NuxtLink>
        </common-info-hero>

        <ui-shell v-if="entry" size="info" class="detail-layout">
            <program-card :entry="entry" variant="list" />

            <a
                v-if="entry.film.infoUrl"
                class="film-link"
                :href="entry.film.infoUrl"
                target="_blank"
                rel="noreferrer noopener"
            >
                Mehr zum Film
                <Icon name="material-symbols:arrow-outward-rounded" aria-hidden="true" />
            </a>

            <section v-if="warningSnapshot" class="warning-section">
                <header class="warning-section_header">
                    <div>
                        <span>Community-Inhaltshinweise</span>
                        <h2>Was im Film vorkommt</h2>
                    </div>
                    <a :href="`https://www.doesthedogdie.com/media/${warningSnapshot.itemId}`" target="_blank" rel="noreferrer noopener">
                        Quelle: DoesTheDogDie
                        <Icon name="material-symbols:arrow-outward-rounded" aria-hidden="true" />
                    </a>
                </header>

                <p class="warning-section_note">
                    Die Angaben stammen aus Community-Abstimmungen und können Spoiler enthalten. Sie ersetzen keine redaktionelle Prüfung.
                </p>

                <div v-if="confirmedWarnings.length" class="warning-list">
                    <article v-for="warning in confirmedWarnings" :key="warning.topicId" class="warning-row">
                        <Icon name="material-symbols:warning-rounded" aria-hidden="true" />
                        <div>
                            <h3>{{ warning.topicName }}</h3>
                            <p>{{ warning.yesSum }} Ja · {{ warning.noSum }} Nein<span v-if="warning.numComments"> · {{ warning.numComments }} Kommentare</span></p>
                        </div>
                        <span class="warning-row_confidence">{{ warningConfidence(warning) }} % Ja</span>
                    </article>
                </div>
                <div v-else class="warning-empty">
                    <Icon name="material-symbols:check-circle-rounded" aria-hidden="true" />
                    <p>Für diesen Film gibt es aktuell keine mehrheitlich bestätigten Inhaltshinweise.</p>
                </div>
            </section>

            <section v-else class="warning-section warning-section--empty">
                <Icon name="material-symbols:info-rounded" aria-hidden="true" />
                <div>
                    <h2>Noch keine Inhaltshinweise verknüpft</h2>
                    <p>Das Programmteam kann diesen Film in der Verwaltung mit DoesTheDogDie verbinden.</p>
                </div>
            </section>
        </ui-shell>
        </main>
    </ThemePageSwitcher>
</template>

<script setup lang="ts">
import type { ContentWarningStat, ProgramEntry } from '~~/types/program';
import { formatProgramDate } from '~/composables/program';
import ThemePageSwitcher from '~/components/theme/ThemePageSwitcher.vue';
import { usePageSeo } from '~/composables/seo';
import { truncateForMeta } from '~/utils/seo';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { data, error } = await useFetch<{ entry: ProgramEntry }>(`/api/program/${route.params.id}`);
if (error.value) {
    throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: error.value.statusMessage ?? 'Vorstellung nicht gefunden.' });
}

const entry = computed(() => data.value?.entry ?? null);
const warningSnapshot = computed(() => entry.value?.film.contentWarnings ?? null);
const confirmedWarnings = computed(() => (warningSnapshot.value?.stats ?? [])
    .filter(warning => warning.yesSum > warning.noSum)
    .sort((left, right) => right.yesSum - left.yesSum));

usePageSeo(() => ({
    title: entry.value?.film.title ?? 'Vorstellung',
    description: entry.value
        ? `${ formatProgramDate(entry.value.startsAt) } – ${ truncateForMeta(entry.value.film.description, 130) }`
        : null,
    image: entry.value?.film.imagePath,
    type: 'article',
}));

function warningConfidence(warning: ContentWarningStat) {
    const votes = warning.yesSum + warning.noSum;
    return votes ? Math.round((warning.yesSum / votes) * 100) : 0;
}
</script>

<style scoped lang="scss">
.program-detail {
    padding-bottom: clamp(3rem, 7vw, 5rem);
}

.back-link {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    min-height: 44px;
    margin-top: 1rem;

    font-weight: 700;
    color: $secondary300;
    text-underline-offset: 0.2em;

    svg {
        width: 1rem;
        height: 1rem;
    }
}

.detail-layout {
    display: grid;
    gap: 1.25rem;
}

.film-link {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    justify-self: end;

    min-height: 44px;

    font-weight: 700;
    color: $secondary300;
    text-underline-offset: 0.2em;

    svg {
        width: 1rem;
        height: 1rem;
    }
}

.warning-section {
    padding: clamp(1rem, 2.5vw, 1.5rem);
    border: 1px solid $darkgray800;
    border-radius: 14px;
    background: $darkgray900;

    &_header {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        justify-content: space-between;

        span {
            font-size: 0.7rem;
            font-weight: 700;
            color: $secondary300;
            text-transform: uppercase;
            letter-spacing: 0.07em;
        }

        h2 {
            margin: 0.3rem 0 0;
            font-size: 1.45rem;
            color: $lightgray0;
        }

        a {
            display: inline-flex;
            gap: 0.35rem;
            align-items: center;

            min-height: 44px;

            font-size: 0.75rem;
            color: $lightgray200;
            text-underline-offset: 0.2em;

            svg {
                width: 1rem;
            }
        }
    }

    &_note {
        max-width: 72ch;
        margin: 1rem 0 0;

        font-size: 0.8rem;
        line-height: 1.55;
        color: $lightgray300;
    }

    &--empty {
        display: flex;
        gap: 0.8rem;
        align-items: flex-start;

        > svg {
            flex: 0 0 auto;
            width: 1.5rem;
            height: 1.5rem;
            color: $secondary300;
        }

        h2,
        p {
            margin: 0;
        }

        h2 {
            font-size: 1rem;
            color: $lightgray0;
        }

        p {
            margin-top: 0.35rem;
            line-height: 1.55;
            color: $lightgray300;
        }
    }
}

.warning-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    margin-top: 1rem;
}

.warning-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.65rem;
    align-items: center;

    padding: 0.75rem;
    border: 1px solid $darkgray800;
    border-radius: 8px;

    background: $darkgray950;

    > svg {
        width: 1.2rem;
        height: 1.2rem;
        color: $secondary300;
    }

    h3,
    p {
        margin: 0;
    }

    h3 {
        font-size: 0.86rem;
        color: $lightgray100;
    }

    p {
        margin-top: 0.25rem;
        font-size: 0.7rem;
        color: $lightgray400;
    }

    &_confidence {
        font-size: 0.7rem;
        font-weight: 700;
        color: $secondary300;
        white-space: nowrap;
    }
}

.warning-empty {
    display: flex;
    gap: 0.65rem;
    align-items: center;

    margin-top: 1rem;

    color: $lightgray200;

    svg {
        width: 1.25rem;
        color: $success400;
    }
}

@include mobileOnly {
    .warning-section_header {
        flex-direction: column;
    }

    .warning-list {
        grid-template-columns: 1fr;
    }

    .warning-row {
        grid-template-columns: auto minmax(0, 1fr);

        &_confidence {
            grid-column: 2;
        }
    }
}
</style>