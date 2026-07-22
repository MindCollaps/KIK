<template>
    <section class="admin-workspace">
        <aside class="film-sidebar">
            <div class="film-sidebar_heading">
                <div>
                    <p>Filmdatenbank</p>
                    <h1>Filme</h1>
                </div>
                <ui-button tag="button" type="secondary" class="new-entry-button" @click="createFilm">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neu
                </ui-button>
            </div>

            <div class="sort-row" aria-label="Sortierung">
                <ui-button
v-for="option in sortOptions" :key="option.value"
                    tag="button"
                    type="pill"
                    :active="sortMode === option.value"
                    @click="sortMode = option.value"
                >
                    {{ option.label }}
                </ui-button>
            </div>

            <div v-if="filmsPending" class="admin-list-state">Filme werden geladen …</div>
            <div v-else-if="filmsError" class="admin-list-state admin-list-state--error">
                <p>{{ filmsError }}</p>
                <ui-button tag="button" type="secondary" @click="loadFilms()">Erneut versuchen</ui-button>
            </div>
            <div v-else-if="!sortedFilms.length" class="admin-list-state">
                <Icon name="material-symbols:movie-rounded" aria-hidden="true" />
                <p>Es sind noch keine Filme angelegt.</p>
            </div>
            <div v-else class="entry-list">
                <article
                    v-for="filmEntry in sortedFilms"
                    :key="filmEntry.id"
                    class="entry-row"
                    :class="{ 'entry-row--selected': selectedFilm?.id === filmEntry.id }"
                >
                    <ui-button tag="button" type="secondary" class="entry-row_main" @click="selectFilm(filmEntry)">
                        <strong>{{ filmEntry.title }}</strong>
                        <span class="entry-row_meta">
                            {{ filmEntry.timesShown }}× gezeigt
                            <template v-if="filmEntry.lastShownAt"> · zuletzt {{ formatCompactDate(filmEntry.lastShownAt) }}</template>
                            <template v-else> · noch nie gezeigt</template>
                        </span>
                    </ui-button>
                    <ui-button tag="button" type="secondary" class="entry-row_delete" :aria-label="`${filmEntry.title} löschen`" @click="deleteFilm(filmEntry)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </ui-button>
                </article>
            </div>
        </aside>

        <section class="editor-pane">
            <admin-film-editor
                v-if="editorOpen"
                :key="selectedFilm?.id ?? 'new'"
                :film="selectedFilm"
                :saving="savingFilm"
                @save="saveFilm"
                @cancel="closeEditor"
            />
            <div v-else class="editor-empty">
                <div class="editor-empty_mark"><Icon name="material-symbols:movie-rounded" aria-hidden="true" /></div>
                <h2>Wähle einen Film</h2>
                <p>Bearbeite einen vorhandenen Film oder lege einen neuen an, damit er im Programm ausgewählt werden kann.</p>
                <ui-button tag="button" type="secondary" @click="createFilm">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neuer Film
                </ui-button>
            </div>
        </section>
    </section>
</template>

<script setup lang="ts">
import type { FilmInput, FilmSortMode, FilmWithStats } from '~~/types/program';
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';

interface ApiError {
    data?: { statusMessage?: string };
}

const films = ref<FilmWithStats[]>([]);
const filmsPending = ref(false);
const filmsError = ref('');
const selectedFilm = ref<FilmWithStats | null>(null);
const editorOpen = ref(false);
const savingFilm = ref(false);
const sortMode = ref<FilmSortMode>('title');
const { showToast } = useToastManager();

const sortOptions: Array<{ value: FilmSortMode; label: string }> = [
    { value: 'title', label: 'Alphabetisch' },
    { value: 'lastShown', label: 'Zuletzt gezeigt' },
    { value: 'timesShown', label: 'Meistgezeigt' },
];

const sortedFilms = computed(() => {
    const list = [...films.value];
    if (sortMode.value === 'title') {
        return list.sort((a, b) => a.title.localeCompare(b.title, 'de'));
    }
    if (sortMode.value === 'timesShown') {
        return list.sort((a, b) => b.timesShown - a.timesShown || a.title.localeCompare(b.title, 'de'));
    }
    return list.sort((a, b) => {
        if (!a.lastShownAt && !b.lastShownAt) return a.title.localeCompare(b.title, 'de');
        if (!a.lastShownAt) return 1;
        if (!b.lastShownAt) return -1;
        return new Date(b.lastShownAt).getTime() - new Date(a.lastShownAt).getTime();
    });
});

loadFilms();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

async function loadFilms() {
    filmsPending.value = true;
    filmsError.value = '';
    try {
        const response = await $fetch<{ films: FilmWithStats[] }>('/api/admin/film');
        films.value = response.films;
    }
    catch (error: unknown) {
        filmsError.value = apiErrorMessage(error, 'Die Filme konnten nicht geladen werden.');
    }
    finally {
        filmsPending.value = false;
    }
}

function createFilm() {
    selectedFilm.value = null;
    editorOpen.value = true;
}

function selectFilm(filmEntry: FilmWithStats) {
    selectedFilm.value = filmEntry;
    editorOpen.value = true;
}

function closeEditor() {
    selectedFilm.value = null;
    editorOpen.value = false;
}

async function saveFilm(input: FilmInput) {
    savingFilm.value = true;
    try {
        if (selectedFilm.value) {
            await $fetch(`/api/admin/film/${selectedFilm.value.id}`, { method: 'PUT', body: input });
        }
        else {
            await $fetch('/api/admin/film', { method: 'POST', body: input });
        }
        await loadFilms();
        closeEditor();
        showToast({
            mode: ToastMode.Success,
            title: 'Gespeichert',
            message: 'Der Film wurde gespeichert.',
        });
    }
    catch (error: unknown) {
        const message = apiErrorMessage(error, 'Der Film konnte nicht gespeichert werden.');
        filmsError.value = message;
        showToast({
            mode: ToastMode.Error,
            title: 'Speichern fehlgeschlagen',
            message,
        });
    }
    finally {
        savingFilm.value = false;
    }
}

async function deleteFilm(filmEntry: FilmWithStats) {
    if (!confirm(`„${filmEntry.title}“ wirklich löschen?`)) return;
    try {
        await $fetch(`/api/admin/film/${filmEntry.id}`, { method: 'DELETE' });
        if (selectedFilm.value?.id === filmEntry.id) closeEditor();
        await loadFilms();
    }
    catch (error: unknown) {
        const message = apiErrorMessage(error, 'Der Film konnte nicht gelöscht werden.');
        filmsError.value = message;
        showToast({
            mode: ToastMode.Error,
            title: 'Löschen fehlgeschlagen',
            message,
        });
    }
}

function formatCompactDate(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.admin-workspace {
    display: grid;
    grid-template-columns: minmax(330px, 0.36fr) minmax(0, 0.64fr);
    min-height: calc(100dvh - 116px);
}

.film-sidebar {
    min-width: 0;
    padding: 1.25rem;
    border-right: 1px solid $darkgray850;
    background: $darkgray950;

    &_heading {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;

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
}

.new-entry-button,
.editor-empty :deep(.button) {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 44px;
    padding: 0 1rem;
    border: 0;
    border-radius: 6px;

    font: inherit;
    font-weight: 700;
    color: $whiteOrig;

    background: $primary500;

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }
}

.sort-row {
    overflow-x: auto;
    display: flex;
    gap: 0.4rem;

    margin-top: 1.25rem;
    padding-bottom: 0.35rem;

    :deep(.button) {
        min-height: 36px;
        font-size: 0.8rem;
        white-space: nowrap;
    }
}

.entry-list {
    display: grid;
    gap: 0.55rem;
    margin-top: 1rem;
}

.entry-row {
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 44px;

    border: 1px solid $darkgray800;
    border-radius: 9px;

    background: $darkgray900;

    &--selected {
        border-color: $secondary600;
        background: $darkgray875;
    }

    &_main,
    &_delete {
        cursor: pointer;
        border: 0;
        color: inherit;
        background: transparent;

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: -3px;
        }
    }

    &_main {
        padding: 0.8rem;
        text-align: left;

        :deep(.button_content) {
            display: grid;
            gap: 0.35rem;
            align-items: baseline;

            width: 100%;
            min-width: 0;
        }

        :deep(strong) {
            color: $lightgray50;
            overflow-wrap: anywhere;
        }
    }

    &_meta {
        font-size: 0.72rem;
        color: $secondary300;
    }

    &_delete {
        display: grid;
        place-items: center;
        border-left: 1px solid $darkgray800;

        &:hover {
            color: $error300;
            background: rgb(194 37 105 / 8%);
        }
    }
}

.admin-list-state {
    display: grid;
    place-items: center;

    min-height: 180px;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed $darkgray700;
    border-radius: 10px;

    color: $lightgray300;
    text-align: center;

    svg {
        width: 2rem;
        height: 2rem;
        color: $secondary300;
    }

    &--error {
        color: $error300;

        :deep(.button) {
            cursor: pointer;

            min-height: 40px;
            padding: 0 0.75rem;
            border: 1px solid $darkgray700;
            border-radius: 6px;

            color: $lightgray100;

            background: transparent;
        }
    }
}

.editor-pane {
    min-width: 0;
    padding: clamp(1rem, 2.5vw, 2rem);
}

.editor-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: calc(100dvh - 180px);

    text-align: center;

    &_mark {
        display: grid;
        place-items: center;

        width: 72px;
        height: 72px;
        border: 1px solid $darkgray700;
        border-radius: 14px;

        color: $secondary300;

        background: $darkgray900;

        svg {
            width: 2rem;
            height: 2rem;
        }
    }

    h2 {
        margin: 1.25rem 0 0;
        color: $lightgray0;
    }

    p {
        max-width: 42ch;
        margin: 0.5rem 0 1.25rem;
        line-height: 1.55;
        color: $lightgray300;
    }
}

@include mobile {
    .admin-workspace {
        grid-template-columns: 1fr;
    }

    .film-sidebar {
        border-right: 0;
        border-bottom: 1px solid $darkgray850;
    }

    .editor-empty {
        min-height: 320px;
    }
}

@include mobileOnly {
    .film-sidebar,
    .editor-pane {
        padding: 1rem;
    }
}
</style>
