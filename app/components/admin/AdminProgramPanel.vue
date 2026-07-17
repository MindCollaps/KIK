<template>
    <section class="admin-workspace">
        <aside class="program-sidebar">
            <div class="program-sidebar_heading">
                <div>
                    <p>Redaktionsplan</p>
                    <h1>Programm</h1>
                </div>
                <button class="new-entry-button" type="button" @click="createEntry">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neu
                </button>
            </div>

            <div class="transfer-row">
                <button type="button" class="ghost-button" @click="exportProgram">
                    <Icon name="material-symbols:download-rounded" aria-hidden="true" />
                    Exportieren
                </button>
                <label class="ghost-button">
                    <Icon name="material-symbols:upload-rounded" aria-hidden="true" />
                    Importieren
                    <input type="file" accept="application/json,.json" @change="importProgram">
                </label>
            </div>

            <div class="filter-row" aria-label="Programm filtern">
                <button
                    v-for="filter in filters"
                    :key="filter.value"
                    type="button"
                    :class="{ 'filter-button--active': activeFilter === filter.value }"
                    @click="activeFilter = filter.value"
                >
                    {{ filter.label }}
                    <span>{{ filter.count }}</span>
                </button>
            </div>

            <div v-if="entriesPending" class="admin-list-state">Programm wird geladen …</div>
            <div v-else-if="entriesError" class="admin-list-state admin-list-state--error">
                <p>{{ entriesError }}</p>
                <button type="button" @click="loadEntries()">Erneut versuchen</button>
            </div>
            <div v-else-if="!filteredEntries.length" class="admin-list-state">
                <Icon name="material-symbols:movie-edit-rounded" aria-hidden="true" />
                <p>In dieser Ansicht gibt es noch keine Einträge.</p>
            </div>
            <div v-else class="entry-list">
                <article
                    v-for="entry in filteredEntries"
                    :key="entry.id"
                    class="entry-row"
                    :class="{ 'entry-row--selected': selectedEntry?.id === entry.id }"
                >
                    <button type="button" class="entry-row_main" @click="selectEntry(entry)">
                        <span class="entry-row_date">{{ formatCompactDate(entry.startsAt) }}</span>
                        <strong>{{ entry.title }}</strong>
                        <span class="entry-row_status" :class="`entry-row_status--${entry.status.toLowerCase()}`">
                            {{ statusLabels[entry.status] }}
                        </span>
                    </button>
                    <button type="button" class="entry-row_delete" :aria-label="`${entry.title} löschen`" @click="deleteEntry(entry)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </article>
            </div>
        </aside>

        <section class="editor-pane">
            <admin-program-editor
                v-if="editorOpen"
                :key="selectedEntry?.id ?? 'new'"
                :entry="selectedEntry"
                :saving="savingEntry"
                @save="saveEntry"
                @cancel="closeEditor"
            />
            <div v-else class="editor-empty">
                <div class="editor-empty_mark"><Icon name="material-symbols:movie-edit-rounded" aria-hidden="true" /></div>
                <h2>Wähle eine Vorstellung</h2>
                <p>Bearbeite einen vorhandenen Eintrag oder plane eine neue Vorstellung.</p>
                <button type="button" @click="createEntry">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neue Vorstellung
                </button>
            </div>
        </section>
    </section>
</template>

<script setup lang="ts">
import type { ProgramEntry, ProgramEntryInput, ProgramStatus } from '~~/types/program';
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';
import { downloadJson } from '~/utils/content-blocks';

interface ApiError {
    data?: { statusMessage?: string };
}

const entries = ref<ProgramEntry[]>([]);
const entriesPending = ref(false);
const entriesError = ref('');
const selectedEntry = ref<ProgramEntry | null>(null);
const editorOpen = ref(false);
const savingEntry = ref(false);
const activeFilter = ref<'ALL' | ProgramStatus>('ALL');
const { showToast } = useToastManager();

const statusLabels: Record<ProgramStatus, string> = {
    DRAFT: 'Entwurf',
    SCHEDULED: 'Geplant',
    PUBLISHED: 'Veröffentlicht',
    HIDDEN: 'Verborgen',
};

const filters = computed(() => [
    { value: 'ALL' as const, label: 'Alle', count: entries.value.length },
    { value: 'DRAFT' as const, label: 'Entwürfe', count: entries.value.filter(entry => entry.status === 'DRAFT').length },
    { value: 'SCHEDULED' as const, label: 'Geplant', count: entries.value.filter(entry => entry.status === 'SCHEDULED').length },
    { value: 'PUBLISHED' as const, label: 'Online', count: entries.value.filter(entry => entry.status === 'PUBLISHED').length },
    { value: 'HIDDEN' as const, label: 'Verborgen', count: entries.value.filter(entry => entry.status === 'HIDDEN').length },
]);

const filteredEntries = computed(() => activeFilter.value === 'ALL'
    ? entries.value
    : entries.value.filter(entry => entry.status === activeFilter.value));

loadEntries();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

async function loadEntries() {
    entriesPending.value = true;
    entriesError.value = '';
    try {
        const response = await $fetch<{ entries: ProgramEntry[] }>('/api/admin/program');
        entries.value = response.entries;
    }
    catch (error: unknown) {
        entriesError.value = apiErrorMessage(error, 'Das Programm konnte nicht geladen werden.');
    }
    finally {
        entriesPending.value = false;
    }
}

function createEntry() {
    selectedEntry.value = null;
    editorOpen.value = true;
}

function selectEntry(entry: ProgramEntry) {
    selectedEntry.value = entry;
    editorOpen.value = true;
}

function closeEditor() {
    selectedEntry.value = null;
    editorOpen.value = false;
}

async function saveEntry(input: ProgramEntryInput) {
    savingEntry.value = true;
    try {
        if (selectedEntry.value) {
            await $fetch(`/api/admin/program/${selectedEntry.value.id}`, { method: 'PUT', body: input });
        }
        else {
            await $fetch('/api/admin/program', { method: 'POST', body: input });
        }
        await loadEntries();
        closeEditor();
        showToast({
            mode: ToastMode.Success,
            title: 'Gespeichert',
            message: 'Der Programmeintrag wurde gespeichert.',
        });
    }
    catch (error: unknown) {
        const message = apiErrorMessage(error, 'Der Eintrag konnte nicht gespeichert werden.');
        entriesError.value = message;
        showToast({
            mode: ToastMode.Error,
            title: 'Speichern fehlgeschlagen',
            message,
        });
    }
    finally {
        savingEntry.value = false;
    }
}

async function deleteEntry(entry: ProgramEntry) {
    if (!confirm(`„${entry.title}“ wirklich löschen?`)) return;
    try {
        await $fetch(`/api/admin/program/${entry.id}`, { method: 'DELETE' });
        if (selectedEntry.value?.id === entry.id) closeEditor();
        await loadEntries();
    }
    catch (error: unknown) {
        entriesError.value = apiErrorMessage(error, 'Der Eintrag konnte nicht gelöscht werden.');
    }
}

async function exportProgram() {
    try {
        const payload = await $fetch('/api/admin/program-export');
        downloadJson(payload, `kik-programm-${new Date().toISOString().slice(0, 10)}.json`);
    }
    catch (error: unknown) {
        showToast({
            mode: ToastMode.Error,
            title: 'Export fehlgeschlagen',
            message: apiErrorMessage(error, 'Der Export ist fehlgeschlagen.'),
        });
    }
}

async function importProgram(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!confirm('Der Import überschreibt Programmeinträge mit gleicher ID. Fortfahren?')) return;

    try {
        const parsed = JSON.parse(await file.text());
        const result = await $fetch<{ importedEntries: number }>('/api/admin/program-import', { method: 'POST', body: parsed });
        closeEditor();
        await loadEntries();
        showToast({
            mode: ToastMode.Success,
            title: 'Import abgeschlossen',
            message: `${result.importedEntries} Einträge übernommen.`,
        });
    }
    catch (error: unknown) {
        showToast({
            mode: ToastMode.Error,
            title: 'Import fehlgeschlagen',
            message: apiErrorMessage(error, 'Der Import ist fehlgeschlagen. Ist die Datei ein gültiger Programm-Export?'),
        });
    }
}

function formatCompactDate(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
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

.program-sidebar {
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
.editor-empty button {
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

.transfer-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.ghost-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    min-height: 40px;
    padding: 0 0.8rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.8rem;
    color: $lightgray150;

    background: transparent;

    input {
        display: none;
    }

    svg {
        width: 1.05rem;
        height: 1.05rem;
        color: $secondary300;
    }

    &:hover {
        border-color: $secondary600;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.filter-row {
    overflow-x: auto;
    display: flex;
    gap: 0.4rem;

    margin-top: 1.25rem;
    padding-bottom: 0.35rem;

    button {
        cursor: pointer;

        min-height: 36px;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 999px;

        color: $lightgray200;
        white-space: nowrap;

        background: transparent;

        span {
            margin-left: 0.35rem;
            color: $lightgray400;
        }

        &.filter-button--active {
            border-color: $secondary600;
            color: $secondary300;
            background: rgb(192 143 46 / 8%);
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
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
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.35rem 0.75rem;

        padding: 0.8rem;

        text-align: left;

        strong {
            grid-column: 1 / -1;
            color: $lightgray50;
            overflow-wrap: anywhere;
        }
    }

    &_date {
        font-size: 0.72rem;
        color: $secondary300;
    }

    &_status {
        font-size: 0.65rem;
        color: $lightgray300;

        &--published {
            color: $success400;
        }

        &--scheduled {
            color: $secondary300;
        }

        &--hidden {
            color: $lightgray400;
        }
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

        button {
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

    .program-sidebar {
        border-right: 0;
        border-bottom: 1px solid $darkgray850;
    }

    .editor-empty {
        min-height: 320px;
    }
}

@include mobileOnly {
    .program-sidebar,
    .editor-pane {
        padding: 1rem;
    }
}
</style>
