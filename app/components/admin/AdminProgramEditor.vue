<template>
    <ui-form class="program-editor" @submit.prevent="submit">
        <header class="program-editor_header">
            <div>
                <p>{{ entry ? 'Eintrag bearbeiten' : 'Neue Vorstellung' }}</p>
                <h2>{{ entry?.film.title || 'Vorstellung planen' }}</h2>
            </div>
            <ui-button v-if="entry" tag="button" type="secondary" class="icon-button" aria-label="Editor schließen" @click="$emit('cancel')">
                <Icon name="material-symbols:close-rounded" aria-hidden="true" />
            </ui-button>
        </header>

        <div class="program-editor_section film-picker">
            <div class="film-picker_heading">
                <div>
                    <h3>Film</h3>
                    <p>Welcher Film aus der Filmdatenbank läuft in dieser Vorstellung?</p>
                </div>
            </div>

            <div v-if="selectedFilm" class="linked-film">
                <img v-if="selectedFilm.imagePath" :src="selectedFilm.imagePath" :alt="selectedFilm.imageAlt || `Poster zu ${selectedFilm.title}`">
                <span v-else class="linked-film_placeholder"><Icon name="material-symbols:movie-rounded" aria-hidden="true" /></span>
                <div>
                    <strong>{{ selectedFilm.title }}</strong>
                    <span>{{ selectedFilm.releaseYear ?? 'Jahr unbekannt' }}{{ selectedFilm.director ? ` · ${selectedFilm.director}` : '' }}</span>
                </div>
                <ui-button tag="button" type="secondary" @click="clearFilm">Ändern</ui-button>
            </div>

            <template v-else>
                <p v-if="filmsError" class="film-picker_error" role="alert">{{ filmsError }}</p>
                <div v-else-if="filmsPending" class="film-picker_hint">Filme werden geladen …</div>
                <template v-else>
                    <ui-input-search v-model="filmSearchTerm" :maxlength="160" placeholder="Film suchen" class="film-picker_control" />
                    <div v-if="matchingFilms.length" class="film-results">
                        <ui-button
v-for="candidate in matchingFilms" :key="candidate.id"
                            tag="button"
                            type="secondary"
                            class="film-result"
                            @click="form.filmId = candidate.id"
                        >
                            <img v-if="candidate.imagePath" :src="candidate.imagePath" :alt="`Poster zu ${candidate.title}`" loading="lazy">
                            <span v-else class="film-result_placeholder"><Icon name="material-symbols:movie-rounded" aria-hidden="true" /></span>
                            <span class="film-result_copy">
                                <strong>{{ candidate.title }}</strong>
                                <small>{{ candidate.releaseYear ?? 'Jahr unbekannt' }}</small>
                            </span>
                        </ui-button>
                    </div>
                    <p v-else class="film-picker_hint">
                        Kein passender Film gefunden. Noch keinen passenden Film? Lege ihn zuerst unter „Filme“ an.
                    </p>
                </template>
            </template>
        </div>

        <div class="program-editor_section">
            <h3>Termin</h3>
            <div class="form-grid">
                <label class="field">
                    <span>Vorstellungsbeginn</span>
                    <ui-input-date-time v-model="form.startsAt" required />
                </label>
                <label class="field">
                    <span>Spielort <small>optional</small></span>
                    <input v-model.trim="form.venue" maxlength="160" autocomplete="off">
                </label>
                <label class="field">
                    <span>Fassung/Sprache <small>optional</small></span>
                    <input v-model.trim="form.language" maxlength="80" placeholder="z. B. Englisch (OmeU)">
                </label>
                <label class="field">
                    <span>Eintritt in Euro <small>optional</small></span>
                    <input v-model="form.price" :disabled="form.isFree" min="0" max="1000" step="0.50" type="number">
                </label>
                <ui-checkbox v-model="form.isFree" class="check-field">Eintritt frei</ui-checkbox>
            </div>
        </div>

        <div class="program-editor_section">
            <h3>Darstellung</h3>
            <div class="segmented-control" aria-label="Kartenstil">
                <ui-input-radio
                    v-for="option in styleOptions"
                    :key="option.value"
                    v-model="form.style"
                    name="style"
                    :value="option.value"
                >
                    {{ option.label }}
                </ui-input-radio>
            </div>

            <label v-if="form.style === 'HIGHLIGHTED' || form.style === 'CUSTOM'" class="color-field">
                <span>{{ form.style === 'CUSTOM' ? 'Badge- und Rahmenfarbe' : 'Highlight-Farbe' }}</span>
                <ui-input-color v-model="form.highlightColor" />
                <code>{{ form.highlightColor }}</code>
            </label>

            <div v-if="form.style === 'CUSTOM'" class="custom-badge-fields">
                <label class="field field--wide">
                    <span>Badge-Text</span>
                    <input v-model.trim="form.customBadgeText" maxlength="48" placeholder="z. B. Ausverkauft" required>
                </label>
                <label class="field field--wide">
                    <span>Badge-Icon <small>optional</small></span>
                    <ui-icon-picker v-model="form.customBadgeIcon" />
                </label>
                <ui-checkbox v-model="form.customBadgeBorder" class="check-field">Rahmen um Badge</ui-checkbox>
                <ui-checkbox v-model="form.customCardBorder" class="check-field">Rahmen um ganze Karte</ui-checkbox>
            </div>
        </div>

        <div class="program-editor_section program-editor_section--publication">
            <h3>Veröffentlichung</h3>
            <div class="status-grid" aria-label="Veröffentlichungsstatus">
                <ui-input-radio
                    v-for="option in statusOptions"
                    :key="option.value"
                    v-model="form.status"
                    name="status"
                    :value="option.value"
                    variant="card"
                    :icon="option.icon"
                >
                    {{ option.label }}
                    <template #description>{{ option.description }}</template>
                </ui-input-radio>
            </div>

            <div v-if="form.status === 'SCHEDULED'" class="form-grid schedule-fields">
                <label class="field">
                    <span>Sichtbar ab</span>
                    <ui-input-date-time v-model="form.visibleFrom" required />
                </label>
                <label class="field">
                    <span>Sichtbar bis <small>optional</small></span>
                    <ui-input-date-time v-model="form.visibleUntil" />
                </label>
            </div>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <footer class="program-editor_actions">
            <ui-button v-if="entry" type="secondary" tag="button" @click="$emit('cancel')">Abbrechen</ui-button>
            <ui-button tag="button" type="secondary" class="save-button" button-type="submit" :disabled="saving">
                <Icon :name="saving ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                {{ saving ? 'Wird gespeichert …' : 'Programm speichern' }}
            </ui-button>
        </footer>
    </ui-form>
</template>

<script setup lang="ts">
import type { FilmWithStats, ProgramEntry, ProgramEntryInput, ProgramStatus, ProgramStyle } from '~~/types/program';

const props = defineProps<{
    entry: ProgramEntry | null;
    saving?: boolean;
}>();

const emit = defineEmits<{
    save: [value: ProgramEntryInput];
    cancel: [];
}>();

const styleOptions: Array<{ value: ProgramStyle; label: string }> = [
    { value: 'DEFAULT', label: 'Standard' },
    { value: 'SPECIAL', label: 'Sondervorstellung' },
    { value: 'HIGHLIGHTED', label: 'Highlight' },
    { value: 'CUSTOM', label: 'Custom' },
];

const statusOptions: Array<{ value: ProgramStatus; label: string; description: string; icon: string }> = [
    { value: 'DRAFT', label: 'Entwurf', description: 'Nur in der Verwaltung sichtbar', icon: 'material-symbols:edit-note-rounded' },
    { value: 'SCHEDULED', label: 'Geplant', description: 'Wird automatisch sichtbar', icon: 'material-symbols:schedule-rounded' },
    { value: 'PUBLISHED', label: 'Veröffentlicht', description: 'Ab sofort öffentlich', icon: 'material-symbols:visibility-rounded' },
    { value: 'HIDDEN', label: 'Verborgen', description: 'Bewusst nicht öffentlich', icon: 'material-symbols:visibility-off-rounded' },
];

const errorMessage = ref('');

const films = ref<FilmWithStats[]>([]);
const filmsPending = ref(true);
const filmsError = ref('');
const filmSearchTerm = ref('');

interface ApiError {
    data?: { statusMessage?: string };
}

async function loadFilms() {
    filmsPending.value = true;
    filmsError.value = '';
    try {
        const response = await $fetch<{ films: FilmWithStats[] }>('/api/admin/film');
        films.value = response.films;
    }
    catch (error: unknown) {
        filmsError.value = (error as ApiError).data?.statusMessage ?? 'Die Filme konnten nicht geladen werden.';
    }
    finally {
        filmsPending.value = false;
    }
}

loadFilms();

function toLocalDateTime(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function emptyForm() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(20, 0, 0, 0);
    return {
        filmId: '',
        startsAt: toLocalDateTime(tomorrow.toISOString()),
        venue: '',
        language: 'Deutsch',
        price: '4',
        isFree: false,
        style: 'DEFAULT' as ProgramStyle,
        highlightColor: '#D7AC5C',
        customBadgeText: '',
        customBadgeBorder: false,
        customBadgeIcon: '',
        customCardBorder: false,
        status: 'DRAFT' as ProgramStatus,
        visibleFrom: '',
        visibleUntil: '',
    };
}

const form = reactive(emptyForm());

watch(() => props.entry, entry => {
    Object.assign(form, entry ? {
        filmId: entry.filmId,
        startsAt: toLocalDateTime(entry.startsAt),
        venue: entry.venue ?? '',
        language: entry.language ?? '',
        price: entry.priceCents === null ? '' : (entry.priceCents / 100).toFixed(2),
        isFree: entry.isFree,
        style: entry.style,
        highlightColor: entry.highlightColor ?? '#D7AC5C',
        customBadgeText: entry.customBadgeText ?? '',
        customBadgeBorder: entry.customBadgeBorder ?? false,
        customBadgeIcon: entry.customBadgeIcon ?? '',
        customCardBorder: entry.customCardBorder ?? false,
        status: entry.status,
        visibleFrom: toLocalDateTime(entry.visibleFrom),
        visibleUntil: toLocalDateTime(entry.visibleUntil),
    } : emptyForm());
    filmSearchTerm.value = '';
    errorMessage.value = '';
}, { immediate: true });

const selectedFilm = computed(() => {
    if (form.filmId === props.entry?.filmId) return props.entry?.film ?? null;
    return films.value.find(candidate => candidate.id === form.filmId) ?? null;
});

const matchingFilms = computed(() => {
    const term = filmSearchTerm.value.toLocaleLowerCase('de');
    const list = term ? films.value.filter(candidate => candidate.title.toLocaleLowerCase('de').includes(term)) : films.value;
    return list.slice(0, 20);
});

function clearFilm() {
    form.filmId = '';
    filmSearchTerm.value = '';
}

function nullableText(value: string) {
    return value.trim() || null;
}

function submit() {
    errorMessage.value = '';
    if (!form.filmId) {
        errorMessage.value = 'Bitte wähle einen Film aus.';
        return;
    }
    if (form.status === 'SCHEDULED' && !form.visibleFrom) {
        errorMessage.value = 'Bitte lege fest, ab wann der Eintrag sichtbar sein soll.';
        return;
    }
    if (form.visibleFrom && form.visibleUntil && new Date(form.visibleUntil) <= new Date(form.visibleFrom)) {
        errorMessage.value = 'Das Sichtbarkeitsende muss nach dem Start liegen.';
        return;
    }
    if (form.style === 'CUSTOM' && !form.customBadgeText.trim()) {
        errorMessage.value = 'Bitte gib einen Text fuer den Custom-Badge an.';
        return;
    }

    emit('save', {
        filmId: form.filmId,
        startsAt: new Date(form.startsAt).toISOString(),
        venue: nullableText(form.venue),
        language: nullableText(form.language),
        priceCents: form.isFree || form.price === '' ? null : Math.round(Number(form.price) * 100),
        isFree: form.isFree,
        style: form.style,
        highlightColor: form.style === 'HIGHLIGHTED' || form.style === 'CUSTOM' ? form.highlightColor : null,
        customBadgeText: form.style === 'CUSTOM' ? nullableText(form.customBadgeText) : null,
        customBadgeBorder: form.style === 'CUSTOM' ? form.customBadgeBorder : false,
        customBadgeIcon: form.style === 'CUSTOM' ? nullableText(form.customBadgeIcon) : null,
        customCardBorder: form.style === 'CUSTOM' ? form.customCardBorder : false,
        status: form.status,
        visibleFrom: form.status === 'SCHEDULED' && form.visibleFrom ? new Date(form.visibleFrom).toISOString() : null,
        visibleUntil: form.status === 'SCHEDULED' && form.visibleUntil ? new Date(form.visibleUntil).toISOString() : null,
    });
}
</script>

<style scoped lang="scss">
.program-editor {
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

.film-picker {
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

    &_control {
        margin-top: 1rem;
    }

    &_hint {
        margin: 0.75rem 0 0;
        font-size: 0.78rem;
        color: $lightgray300;
    }

    &_error {
        margin: 0.75rem 0 0;
        font-size: 0.78rem;
        color: $error300;
    }
}

.linked-film {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    gap: 0.7rem;
    align-items: center;

    margin-top: 1rem;
    padding: 0.8rem;
    border: 1px solid $success600;
    border-radius: 8px;

    background: rgb(116 184 124 / 7%);

    img,
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
        color: $secondary300;

        svg {
            width: 1.3rem;
        }
    }

    div {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    strong {
        color: $lightgray50;
        overflow-wrap: anywhere;
    }

    span {
        margin-top: 0.15rem;
        font-size: 0.7rem;
        color: $lightgray300;
    }

    :deep(.button) {
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

    min-width: 0;
    padding: 0.55rem;
    border: 1px solid $darkgray800;
    border-radius: 7px;

    color: inherit;
    text-align: left;

    background: $darkgray900;

    :deep(.button_content) {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        gap: 0.75rem;
        align-items: center;
        width: 100%;
    }

    img,
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

    input {
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
}

.check-field {
    align-self: end;
}

.segmented-control {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.color-field {
    display: flex;
    gap: 0.75rem;
    align-items: center;

    margin-top: 1rem;

    font-size: 0.8rem;
    color: $lightgray200;
}

.custom-badge-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: end;

    margin-top: 1rem;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
}

.schedule-fields {
    margin-top: 1rem;
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
    .form-grid,
    .status-grid,
    .custom-badge-fields {
        grid-template-columns: 1fr;
    }

    .program-editor_actions {
        flex-direction: column-reverse;
        align-items: stretch;
    }

    .linked-film {
        grid-template-columns: 48px minmax(0, 1fr);

        :deep(.button) {
            grid-column: 1 / -1;
            justify-self: start;
        }
    }
}
</style>
