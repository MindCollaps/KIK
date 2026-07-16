<template>
    <section class="pages-panel">
        <aside class="pages-panel_sidebar">
            <div class="pages-panel_heading">
                <div>
                    <p>Inhalte</p>
                    <h1>Seiten</h1>
                </div>
                <button class="new-page-button" type="button" @click="createPage">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neu
                </button>
            </div>

            <div v-if="pending" class="pages-panel_state">Seiten werden geladen …</div>
            <div v-else-if="loadError" class="pages-panel_state pages-panel_state--error">
                <p>{{ loadError }}</p>
                <button type="button" @click="loadPages()">Erneut versuchen</button>
            </div>
            <div v-else class="page-list">
                <article
                    v-for="page in pages"
                    :key="page.id"
                    class="page-row"
                    :class="{ 'page-row--selected': selectedPage?.id === page.id }"
                >
                    <button type="button" class="page-row_main" @click="selectPage(page)">
                        <span class="page-row_path">/{{ page.slug }}</span>
                        <strong>{{ page.title }}</strong>
                        <span class="page-row_status" :class="{ 'page-row_status--published': page.status === 'PUBLISHED' }">
                            {{ page.status === 'PUBLISHED' ? 'Veröffentlicht' : 'Entwurf' }}
                        </span>
                    </button>
                    <button type="button" class="page-row_delete" :aria-label="`${page.title} löschen`" @click="deletePage(page)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </article>
            </div>
        </aside>

        <section class="pages-panel_editor">
            <p v-if="actionError" class="pages-panel_error" role="alert">{{ actionError }}</p>
            <admin-page-editor
                v-if="editorOpen"
                :key="selectedPage?.id ?? 'new'"
                :page="selectedPage"
                :saving="saving"
                @save="savePage"
                @cancel="closeEditor"
            />
            <div v-else class="pages-panel_empty">
                <div class="pages-panel_empty-mark"><Icon name="material-symbols:web" aria-hidden="true" /></div>
                <h2>Wähle eine Seite</h2>
                <p>Bearbeite eine vorhandene Seite oder lege eine neue an. Jede Seite besteht aus frei kombinierbaren Blöcken.</p>
                <button type="button" @click="createPage">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Neue Seite
                </button>
            </div>
        </section>
    </section>
</template>

<script setup lang="ts">
import type { PageContent, PageRecord } from '~~/types/content';
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';

interface ApiError {
    data?: { statusMessage?: string };
}

const pages = ref<PageRecord[]>([]);
const pending = ref(false);
const loadError = ref('');
const actionError = ref('');
const selectedPage = ref<PageRecord | null>(null);
const editorOpen = ref(false);
const saving = ref(false);
const { showToast } = useToastManager();

loadPages();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

async function loadPages() {
    pending.value = true;
    loadError.value = '';
    try {
        const response = await $fetch<{ pages: PageRecord[] }>('/api/admin/pages');
        pages.value = response.pages;
    }
    catch (error: unknown) {
        loadError.value = apiErrorMessage(error, 'Die Seiten konnten nicht geladen werden.');
    }
    finally {
        pending.value = false;
    }
}

function createPage() {
    selectedPage.value = null;
    editorOpen.value = true;
    actionError.value = '';
}

function selectPage(page: PageRecord) {
    selectedPage.value = page;
    editorOpen.value = true;
    actionError.value = '';
}

function closeEditor() {
    selectedPage.value = null;
    editorOpen.value = false;
}

async function savePage(content: PageContent) {
    saving.value = true;
    actionError.value = '';
    try {
        if (selectedPage.value) {
            const response = await $fetch<{ page: PageRecord }>(`/api/admin/pages/${selectedPage.value.id}`, { method: 'PUT', body: content });
            selectedPage.value = response.page;
        }
        else {
            const response = await $fetch<{ page: PageRecord }>('/api/admin/pages', { method: 'POST', body: content });
            selectedPage.value = response.page;
        }
        await loadPages();
        showToast({
            mode: ToastMode.Success,
            title: 'Gespeichert',
            message: 'Die Seite wurde gespeichert.',
        });
    }
    catch (error: unknown) {
        const message = apiErrorMessage(error, 'Die Seite konnte nicht gespeichert werden.');
        actionError.value = message;
        showToast({
            mode: ToastMode.Error,
            title: 'Speichern fehlgeschlagen',
            message,
        });
    }
    finally {
        saving.value = false;
    }
}

async function deletePage(page: PageRecord) {
    if (!confirm(`Die Seite „${page.title}“ (/${page.slug}) wirklich löschen?`)) return;
    actionError.value = '';
    try {
        await $fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE' });
        if (selectedPage.value?.id === page.id) closeEditor();
        await loadPages();
    }
    catch (error: unknown) {
        actionError.value = apiErrorMessage(error, 'Die Seite konnte nicht gelöscht werden.');
    }
}
</script>

<style scoped lang="scss">
.pages-panel {
    display: grid;
    grid-template-columns: minmax(330px, 0.36fr) minmax(0, 0.64fr);
    min-height: calc(100dvh - 116px);

    &_sidebar {
        min-width: 0;
        padding: 1.25rem;
        border-right: 1px solid $darkgray850;
        background: $darkgray950;
    }

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

    &_state {
        display: grid;
        place-items: center;

        min-height: 180px;
        margin-top: 1rem;
        padding: 1rem;
        border: 1px dashed $darkgray700;
        border-radius: 10px;

        color: $lightgray300;
        text-align: center;

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

    &_editor {
        min-width: 0;
        padding: clamp(1rem, 2.5vw, 2rem);
    }

    &_error {
        margin: 0 0 1rem;
        padding: 0.75rem;
        border: 1px solid $error500;
        border-radius: 8px;

        color: $error300;

        background: rgb(194 37 105 / 8%);
    }

    &_empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        min-height: calc(100dvh - 180px);

        text-align: center;

        h2 {
            margin: 1.25rem 0 0;
            color: $lightgray0;
        }

        p {
            max-width: 46ch;
            margin: 0.5rem 0 1.25rem;
            line-height: 1.55;
            color: $lightgray300;
        }

        button {
            cursor: pointer;

            display: inline-flex;
            gap: 0.5rem;
            align-items: center;

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
    }

    &_empty-mark {
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
}

.new-page-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;

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

.page-list {
    display: grid;
    gap: 0.55rem;
    margin-top: 1.25rem;
}

.page-row {
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

        font: inherit;
        text-align: left;

        strong {
            grid-column: 1 / -1;
            color: $lightgray50;
            overflow-wrap: anywhere;
        }
    }

    &_path {
        font-size: 0.72rem;
        color: $secondary300;
        overflow-wrap: anywhere;
    }

    &_status {
        font-size: 0.65rem;
        color: $lightgray300;

        &--published {
            color: $success400;
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

@include mobile {
    .pages-panel {
        grid-template-columns: 1fr;
    }

    .pages-panel_sidebar {
        border-right: 0;
        border-bottom: 1px solid $darkgray850;
    }

    .pages-panel_empty {
        min-height: 320px;
    }
}

@include mobileOnly {
    .pages-panel_sidebar,
    .pages-panel_editor {
        padding: 1rem;
    }
}
</style>
