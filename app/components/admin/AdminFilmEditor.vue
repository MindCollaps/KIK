<template>
    <form class="film-editor" @submit.prevent="submit">
        <header class="film-editor_header">
            <div>
                <p>{{ film ? 'Film bearbeiten' : 'Neuer Film' }}</p>
                <h2>{{ film?.title || 'Film anlegen' }}</h2>
            </div>
            <button v-if="film" type="button" class="icon-button" aria-label="Editor schließen" @click="$emit('cancel')">
                <Icon name="material-symbols:close-rounded" aria-hidden="true" />
            </button>
        </header>

        <div class="film-editor_section film-search">
            <div class="film-search_heading">
                <div>
                    <h3>Film suchen</h3>
                    <p>Mit DoesTheDogDie verknüpfen und Filmdaten übernehmen.</p>
                </div>
                <span v-if="form.doesTheDogDieId" class="film-search_linked">
                    <Icon name="material-symbols:link-rounded" aria-hidden="true" />
                    Verknüpft
                </span>
            </div>

            <div v-if="form.doesTheDogDieId" class="linked-film">
                <Icon name="material-symbols:verified-rounded" aria-hidden="true" />
                <div>
                    <strong>{{ linkedFilmName || form.title }}</strong>
                    <span>DoesTheDogDie-ID {{ form.doesTheDogDieId }}</span>
                </div>
                <button type="button" @click="unlinkFilm">Verknüpfung lösen</button>
            </div>

            <template v-else>
                <div class="film-search_control">
                    <ui-input-search
                        v-model="filmSearchTerm"
                        minlength="2"
                        maxlength="160"
                        placeholder="Filmtitel suchen"
                        @search="searchFilms"
                    />
                    <button type="button" :disabled="filmSearchPending || filmSearchTerm.length < 2" @click="searchFilms">
                        {{ filmSearchPending ? 'Suche …' : 'Suchen' }}
                    </button>
                </div>

                <p v-if="filmSearchError" class="film-search_error" role="alert">{{ filmSearchError }}</p>
                <div v-if="filmSearchResults.length" class="film-results">
                    <button
                        v-for="result in filmSearchResults"
                        :key="result.id"
                        type="button"
                        class="film-result"
                        :disabled="selectingFilmId === result.id"
                        @click="selectFilm(result)"
                    >
                        <img v-if="result.posterImage" :src="result.posterImage" :alt="`Poster zu ${result.name}`" loading="lazy">
                        <span v-else class="film-result_placeholder"><Icon name="material-symbols:movie-rounded" aria-hidden="true" /></span>
                        <span class="film-result_copy">
                            <strong>{{ result.name }}</strong>
                            <small>{{ result.releaseYear ?? 'Jahr unbekannt' }}</small>
                            <span>{{ result.overview || 'Keine Kurzbeschreibung verfügbar.' }}</span>
                        </span>
                        <Icon :name="selectingFilmId === result.id ? 'material-symbols:progress-activity' : 'material-symbols:add-link-rounded'" aria-hidden="true" />
                    </button>
                </div>
            </template>
        </div>

        <div class="film-editor_section">
            <h3>Das Wesentliche</h3>
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Titel</span>
                    <input v-model.trim="form.title" required maxlength="160" autocomplete="off">
                </label>
                <label class="field field--wide">
                    <span>Beschreibung</span>
                    <textarea v-model.trim="form.description" required maxlength="4000" rows="5" />
                </label>
            </div>

            <div class="image-field">
                <div v-if="form.imagePath" class="image-preview">
                    <img :src="form.imagePath" :alt="form.imageAlt || 'Vorschau des Filmposters'">
                    <button type="button" class="image-remove" @click="removeImage">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                        Bild entfernen
                    </button>
                </div>
                <ui-input-file accept="image/jpeg,image/png,image/webp" :disabled="uploading" @select="uploadImage">
                    <Icon name="material-symbols:add-photo-alternate-rounded" aria-hidden="true" />
                    <span>{{ uploading ? 'Bild wird hochgeladen …' : 'Poster/Banner hochladen' }}</span>
                </ui-input-file>
                <p>JPEG, PNG oder WebP, maximal 8 MB. Empfohlenes Format: 16:7.</p>
                <label v-if="form.imagePath" class="field">
                    <span>Bildbeschreibung <small>optional</small></span>
                    <input v-model.trim="form.imageAlt" maxlength="240" placeholder="Was ist auf dem Bild zu sehen?">
                </label>
            </div>
        </div>

        <div class="film-editor_section">
            <h3>Filmdetails</h3>
            <div class="form-grid">
                <label class="field">
                    <span>Laufzeit in Minuten</span>
                    <input v-model.number="form.runtimeMinutes" min="1" max="600" type="number">
                </label>
                <label class="field">
                    <span>Altersfreigabe</span>
                    <input v-model.trim="form.ageRating" maxlength="40" placeholder="z. B. FSK 12">
                </label>
                <label class="field">
                    <span>Regie</span>
                    <input v-model.trim="form.director" maxlength="160">
                </label>
                <label class="field">
                    <span>Land</span>
                    <input v-model.trim="form.country" maxlength="120">
                </label>
                <label class="field">
                    <span>Erscheinungsjahr</span>
                    <input v-model.number="form.releaseYear" min="1888" max="2200" type="number">
                </label>
                <label class="field field--wide">
                    <span>Weiterführender Link</span>
                    <input v-model.trim="form.infoUrl" type="url" maxlength="1000" placeholder="https://…">
                </label>
            </div>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <footer class="film-editor_actions">
            <ui-button v-if="film" type="secondary" tag="button" @click="$emit('cancel')">Abbrechen</ui-button>
            <button class="save-button" type="submit" :disabled="saving || uploading">
                <Icon :name="saving ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                {{ saving ? 'Wird gespeichert …' : 'Film speichern' }}
            </button>
        </footer>
    </form>
</template>

<script setup lang="ts">
import type { ContentWarningSnapshot, DoesTheDogDieSearchResult, Film, FilmInput } from '~~/types/program';

const props = defineProps<{
    film: Film | null;
    saving?: boolean;
}>();

const emit = defineEmits<{
    save: [value: FilmInput];
    cancel: [];
}>();

const uploading = ref(false);
const errorMessage = ref('');
const filmSearchTerm = ref('');
const filmSearchPending = ref(false);
const filmSearchError = ref('');
const filmSearchResults = ref<DoesTheDogDieSearchResult[]>([]);
const selectingFilmId = ref<number | null>(null);
const linkedFilmName = ref('');

interface ApiError {
    data?: {
        statusMessage?: string;
    };
}

function emptyForm() {
    return {
        title: '',
        description: '',
        runtimeMinutes: null as number | null,
        ageRating: '',
        director: '',
        country: '',
        releaseYear: null as number | null,
        infoUrl: '',
        imagePath: '',
        imageAlt: '',
        doesTheDogDieId: null as number | null,
    };
}

const form = reactive(emptyForm());

watch(() => props.film, film => {
    Object.assign(form, film ? {
        title: film.title,
        description: film.description,
        runtimeMinutes: film.runtimeMinutes ?? null,
        ageRating: film.ageRating ?? '',
        director: film.director ?? '',
        country: film.country ?? '',
        releaseYear: film.releaseYear ?? null,
        infoUrl: film.infoUrl ?? '',
        imagePath: film.imagePath ?? '',
        imageAlt: film.imageAlt ?? '',
        doesTheDogDieId: film.doesTheDogDieId,
    } : emptyForm());
    linkedFilmName.value = film?.contentWarnings?.name ?? '';
    filmSearchResults.value = [];
    filmSearchError.value = '';
    errorMessage.value = '';
}, { immediate: true });

function nullableText(value: string) {
    return value.trim() || null;
}

function submit() {
    errorMessage.value = '';

    emit('save', {
        title: form.title,
        description: form.description,
        runtimeMinutes: form.runtimeMinutes,
        ageRating: nullableText(form.ageRating),
        director: nullableText(form.director),
        country: nullableText(form.country),
        releaseYear: form.releaseYear,
        infoUrl: nullableText(form.infoUrl),
        imagePath: nullableText(form.imagePath),
        imageAlt: nullableText(form.imageAlt),
        doesTheDogDieId: form.doesTheDogDieId,
    });
}

async function searchFilms() {
    if (filmSearchTerm.value.length < 2) return;
    filmSearchPending.value = true;
    filmSearchError.value = '';
    filmSearchResults.value = [];
    try {
        const response = await $fetch<{ items: DoesTheDogDieSearchResult[] }>('/api/admin/does-the-dog-die', {
            query: { q: filmSearchTerm.value },
        });
        filmSearchResults.value = response.items;
        if (!response.items.length) filmSearchError.value = 'Keine passenden Filme gefunden.';
    }
    catch (error: unknown) {
        const apiError = error as ApiError;
        filmSearchError.value = apiError.data?.statusMessage ?? 'Die Filmsuche ist gerade nicht verfügbar.';
    }
    finally {
        filmSearchPending.value = false;
    }
}

async function selectFilm(result: DoesTheDogDieSearchResult) {
    selectingFilmId.value = result.id;
    filmSearchError.value = '';
    try {
        const response = await $fetch<{ item: ContentWarningSnapshot }>(`/api/admin/does-the-dog-die/${result.id}`);
        const posterImage = response.item.posterImage ?? result.posterImage;

        form.doesTheDogDieId = result.id;
        form.title = result.name;
        form.releaseYear = result.releaseYear?.toString() ?? '';
        if (result.overview) form.description = result.overview;
        if (posterImage) {
            try {
                const imported = await $fetch<{ path: string }>('/api/admin/upload-from-url', {
                    method: 'POST',
                    body: { url: posterImage },
                });
                form.imagePath = imported.path;
                if (!form.imageAlt || /^poster\s+/i.test(form.imageAlt)) {
                    form.imageAlt = `Poster zu ${ result.name }`;
                }
            }
            catch {
                filmSearchError.value = 'Film verknuepft, aber das Poster konnte nicht uebernommen werden.';
            }
        }
        linkedFilmName.value = result.name;
        filmSearchResults.value = [];
        filmSearchTerm.value = '';
        if (!response.item.stats.length) {
            filmSearchError.value = 'Verknüpft, aber für diesen Film liegen noch keine Community-Bewertungen vor.';
        }
    }
    catch (error: unknown) {
        const apiError = error as ApiError;
        filmSearchError.value = apiError.data?.statusMessage ?? 'Der Film konnte nicht verknüpft werden.';
    }
    finally {
        selectingFilmId.value = null;
    }
}

function unlinkFilm() {
    form.doesTheDogDieId = null;
    linkedFilmName.value = '';
}

async function uploadImage(file: File) {
    errorMessage.value = '';
    uploading.value = true;
    try {
        const body = new FormData();
        body.append('image', file);
        const response = await $fetch<{ path: string }>('/api/admin/upload', { method: 'POST', body });
        form.imagePath = response.path;
        if (!form.imageAlt) form.imageAlt = file.name.replace(/\.[^.]+$/, '').replaceAll(/[-_]+/g, ' ');
    }
    catch (error: unknown) {
        const apiError = error as ApiError;
        errorMessage.value = apiError.data?.statusMessage ?? 'Das Bild konnte nicht hochgeladen werden.';
    }
    finally {
        uploading.value = false;
    }
}

function removeImage() {
    form.imagePath = '';
    form.imageAlt = '';
}
</script>

<style scoped lang="scss">
.film-editor {
    overflow: hidden;
    border: 1px solid $darkgray800;
    border-radius: 14px;
    background: $darkgray900;

    &_header {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        justify-content: space-between;

        padding: 1.25rem;
        border-bottom: 1px solid $darkgray800;

        p,
        h2 {
            margin: 0;
        }

        p {
            font-size: 0.7rem;
            font-weight: 700;
            color: $secondary300;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        h2 {
            margin-top: 0.35rem;

            font-family: $displayFont;
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 400;
            line-height: 1;
            color: $lightgray0;
            text-transform: uppercase;
            text-wrap: balance;
        }
    }

    &_section {
        padding: 1.25rem;
        border-bottom: 1px solid $darkgray800;

        h3 {
            margin: 0 0 1rem;
            font-size: 1rem;
            color: $lightgray50;
        }
    }

    &_actions {
        position: sticky;
        z-index: 2;
        bottom: 0;

        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;

        padding: 1rem 1.25rem;

        background: rgb(29 24 21 / 96%);
    }
}

.film-search {
    background: rgb(215 172 92 / 4%);

    &_heading {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        justify-content: space-between;

        h3,
        p {
            margin: 0;
        }

        p {
            margin-top: 0.25rem;
            font-size: 0.78rem;
            color: $lightgray300;
        }
    }

    &_linked {
        display: inline-flex;
        gap: 0.3rem;
        align-items: center;

        font-size: 0.72rem;
        font-weight: 700;
        color: $success400;

        svg {
            width: 1rem;
        }
    }

    &_control {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 1rem;

        > :first-child {
            flex: 1;
        }

        button {
            cursor: pointer;

            flex-shrink: 0;

            min-height: 44px;
            padding: 0 0.9rem;
            border: 0;
            border-radius: 8px;

            color: $whiteOrig;

            background: $primary500;

            &:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
        }
    }

    &_error {
        margin: 0.75rem 0 0;
        font-size: 0.78rem;
        color: $error300;
    }
}

.linked-film {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.7rem;
    align-items: center;

    margin-top: 1rem;
    padding: 0.8rem;
    border: 1px solid $success600;
    border-radius: 8px;

    background: rgb(116 184 124 / 7%);

    > svg {
        width: 1.5rem;
        height: 1.5rem;
        color: $success400;
    }

    div {
        display: flex;
        flex-direction: column;
    }

    strong {
        color: $lightgray50;
    }

    span {
        margin-top: 0.15rem;
        font-size: 0.7rem;
        color: $lightgray300;
    }

    button {
        cursor: pointer;

        min-height: 38px;
        border: 0;

        color: $lightgray200;
        text-decoration: underline;
        text-underline-offset: 0.2em;

        background: transparent;
    }
}

.film-results {
    overflow-y: auto;
    display: grid;
    gap: 0.5rem;

    max-height: 390px;
    margin-top: 0.75rem;
}

.film-result {
    cursor: pointer;

    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;

    min-width: 0;
    padding: 0.55rem;
    border: 1px solid $darkgray800;
    border-radius: 7px;

    color: inherit;
    text-align: left;

    background: $darkgray900;

    > img,
    &_placeholder {
        width: 48px;
        height: 68px;
        border-radius: 4px;

        object-fit: cover;
        background: $darkgray800;
    }

    &_placeholder {
        display: grid;
        place-items: center;
    }

    > svg {
        width: 1.3rem;
        color: $secondary300;
    }

    &:hover {
        border-color: $secondary600;
        background: $darkgray875;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }

    &_copy {
        display: flex;
        flex-direction: column;
        min-width: 0;

        strong {
            color: $lightgray50;
        }

        small {
            margin-top: 0.15rem;
            color: $secondary300;
        }

        > span {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;

            margin-top: 0.3rem;

            font-size: 0.72rem;
            line-height: 1.35;
            color: $lightgray300;
        }
    }
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    min-width: 0;

    &--wide {
        grid-column: 1 / -1;
    }

    > span {
        font-size: 0.75rem;
        font-weight: 700;
        color: $lightgray200;

        small {
            font-weight: 400;
            color: $lightgray300;
        }
    }

    input,
    textarea {
        width: 100%;
        min-height: 44px;
        padding: 0.7rem 0.8rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        color: $lightgray50;

        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 25%);
        }

        &:disabled {
            opacity: 0.45;
        }
    }

    textarea {
        resize: vertical;
        min-height: 130px;
        line-height: 1.55;
    }
}

.image-field {
    margin-top: 1.25rem;

    > p {
        margin: 0.55rem 0 0;
        font-size: 0.75rem;
        color: $lightgray300;
    }

    .field {
        margin-top: 1rem;
    }
}

.image-preview {
    position: relative;

    overflow: hidden;

    aspect-ratio: 16 / 7;
    margin-bottom: 0.75rem;
    border: 1px solid $darkgray700;
    border-radius: 10px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.image-remove {
    cursor: pointer;

    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    min-height: 40px;
    padding: 0 0.75rem;
    border: 1px solid $darkgray700;
    border-radius: 6px;

    color: $lightgray50;

    background: rgb(15 12 10 / 90%);
}

.form-error {
    margin: 1rem 1.25rem 0;
    padding: 0.8rem;
    border: 1px solid $error500;
    border-radius: 8px;

    color: $error300;

    background: rgb(194 37 105 / 8%);
}

.save-button,
.icon-button {
    cursor: pointer;

    display: inline-grid;
    place-items: center;

    min-height: 44px;
    border: 0;
    border-radius: 6px;

    color: $whiteOrig;

    background: $primary500;

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }
}

.save-button {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0 1rem;
    font-weight: 700;

    &:disabled {
        cursor: wait;
        opacity: 0.55;
    }
}

.icon-button {
    flex: 0 0 auto;

    width: 44px;
    padding: 0;

    color: $lightgray100;

    background: transparent;
}

@include mobileOnly {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .film-editor_actions {
        flex-direction: column-reverse;
        align-items: stretch;
    }

    .linked-film {
        grid-template-columns: auto minmax(0, 1fr);

        button {
            grid-column: 1 / -1;
            justify-self: start;
        }
    }
}
</style>
