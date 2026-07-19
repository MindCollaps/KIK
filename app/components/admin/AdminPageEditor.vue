<template>
    <form class="page-editor" @submit.prevent="submit">
        <header class="page-editor_header">
            <div>
                <p>{{ page ? 'Seite bearbeiten' : 'Neue Seite' }}</p>
                <h2>{{ draft.title || 'Ohne Titel' }}</h2>
            </div>
            <div class="page-editor_header-actions">
                <button type="button" class="ghost-button" @click="exportPage">
                    <Icon name="material-symbols:download-rounded" aria-hidden="true" />
                    Export
                </button>
                <ui-input-file variant="ghost" accept="application/json,.json" @select="importPage">
                    <Icon name="material-symbols:upload-rounded" aria-hidden="true" />
                    Import
                </ui-input-file>
                <button type="button" class="icon-button" aria-label="Editor schließen" @click="$emit('cancel')">
                    <Icon name="material-symbols:close-rounded" aria-hidden="true" />
                </button>
            </div>
        </header>

        <div class="page-editor_section">
            <h3>Seiteneinstellungen</h3>
            <div class="form-grid">
                <label class="field">
                    <span>Titel</span>
                    <input v-model.trim="draft.title" required maxlength="160">
                </label>
                <label class="field">
                    <span>Pfad <small>leer = Startseite</small></span>
                    <div class="slug-input">
                        <span aria-hidden="true">/</span>
                        <input v-model.trim="draft.slug" maxlength="200" placeholder="z. B. das-kino">
                    </div>
                </label>
                <label class="field field--wide">
                    <span>Meta-Beschreibung <small>optional, für Suchmaschinen</small></span>
                    <textarea v-model="draft.description" rows="2" maxlength="300" />
                </label>
                <label class="field">
                    <span>Stil</span>
                    <ui-select v-model="draft.theme">
                        <option v-for="option in pageThemeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </ui-select>
                </label>
                <label class="field">
                    <span>Status</span>
                    <ui-select v-model="draft.status">
                        <option value="DRAFT">Entwurf</option>
                        <option value="PUBLISHED">Veröffentlicht</option>
                    </ui-select>
                </label>
            </div>
        </div>

        <div class="page-editor_section">
            <h3>Inhaltsblöcke</h3>
            <p v-if="!draft.blocks.length" class="page-editor_empty">
                Diese Seite hat noch keine Blöcke. Füge unten den ersten Block hinzu.
            </p>

            <details
                v-for="(block, index) in draft.blocks"
                :key="block.id"
                class="block-card"
            >
                <summary>
                    <span class="block-card_type">{{ blockTypeLabels[block.type] }}</span>
                    <span class="block-card_title">{{ blockSummary(block) }}</span>
                    <span class="block-card_tools">
                        <button type="button" class="icon-button" :disabled="index === 0" aria-label="Nach oben" @click.prevent="moveBlock(index, -1)">
                            <Icon name="material-symbols:arrow-upward-rounded" aria-hidden="true" />
                        </button>
                        <button type="button" class="icon-button" :disabled="index === draft.blocks.length - 1" aria-label="Nach unten" @click.prevent="moveBlock(index, 1)">
                            <Icon name="material-symbols:arrow-downward-rounded" aria-hidden="true" />
                        </button>
                        <button type="button" class="icon-button icon-button--danger" aria-label="Block entfernen" @click.prevent="removeBlock(index)">
                            <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                        </button>
                    </span>
                    <Icon class="block-card_chevron" name="material-symbols:expand-more-rounded" aria-hidden="true" />
                </summary>
                <div class="block-card_body">
                    <admin-block-fields v-model="draft.blocks[index]!" />
                </div>
            </details>

            <div class="add-block">
                <ui-select v-model="newBlockType">
                    <option v-for="type in blockTypes" :key="type" :value="type">
                        {{ blockTypeLabels[type] }}
                    </option>
                </ui-select>
                <button type="button" @click="addBlock">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Block hinzufügen
                </button>
            </div>
        </div>

        <p v-if="localError" class="page-editor_error" role="alert">{{ localError }}</p>

        <footer class="page-editor_footer">
            <button type="submit" class="save-button" :disabled="saving">
                <Icon :name="saving ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                {{ saving ? 'Wird gespeichert …' : 'Seite speichern' }}
            </button>
        </footer>
    </form>
</template>

<script setup lang="ts">
import type { BlockType, PageBlock, PageContent, PageRecord, PageThemeChoice } from '~~/types/content';
import { blockTypes, resolvePageTheme } from '~~/types/content';
import { blockTypeLabels, clonePlain, createBlock, downloadJson, emptyPage, normalizePageContent } from '~/utils/content-blocks';

const props = defineProps<{
    page: PageRecord | null;
    saving: boolean;
}>();

const emit = defineEmits<{
    save: [page: PageContent];
    cancel: [];
}>();

const localError = ref('');
const newBlockType = ref<BlockType>('markdown');
const pageThemeOptions: Array<{ value: PageThemeChoice; label: string }> = [
    { value: 'default', label: 'Standard (ohne Effekt)' },
    { value: 'sommerkino', label: 'Sommerkino' },
    { value: 'das-kino', label: 'Das Kino' },
    { value: 'programm', label: 'Programm' },
    { value: 'glow', label: 'Glow' },
    { value: 'neon-grid', label: 'Neon Grid' },
];

function toDraft(page: PageRecord | null): PageContent {
    if (!page) return emptyPage();
    return clonePlain({
        slug: page.slug,
        title: page.title,
        description: page.description,
        theme: resolvePageTheme(page.theme),
        status: page.status,
        blocks: Array.isArray(page.blocks) ? page.blocks : [],
    });
}

const draft = reactive<PageContent>(toDraft(props.page));

function blockSummary(block: PageBlock) {
    if ('title' in block && block.title) return block.title;
    if ('eyebrow' in block) return block.eyebrow;
    if (block.type === 'image') return block.alt || block.src;
    return '';
}

function addBlock() {
    draft.blocks.push(createBlock(newBlockType.value));
}

function removeBlock(index: number) {
    draft.blocks.splice(index, 1);
}

function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.blocks.length) return;
    const [block] = draft.blocks.splice(index, 1);
    if (block) draft.blocks.splice(target, 0, block);
}

function exportPage() {
    const payload = { kind: 'kik-page', version: 1, page: normalizePageContent(clonePlain(draft)) };
    downloadJson(payload, `kik-seite-${draft.slug || 'startseite'}.json`);
}

async function importPage(file: File) {
    localError.value = '';
    try {
        const parsed = JSON.parse(await file.text());
        if (parsed?.kind !== 'kik-page' || !parsed.page || !Array.isArray(parsed.page.blocks)) {
            localError.value = 'Die Datei ist kein gültiger Seiten-Export.';
            return;
        }
        Object.assign(draft, parsed.page);
    }
    catch {
        localError.value = 'Die Datei konnte nicht gelesen werden.';
    }
}

function submit() {
    localError.value = '';
    emit('save', normalizePageContent(clonePlain(draft)));
}
</script>

<style scoped lang="scss">
.page-editor {
    display: grid;
    gap: 1.25rem;

    &_header {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;

        p {
            margin: 0;

            font-size: 0.7rem;
            font-weight: 700;
            color: $secondary300;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        h2 {
            margin: 0.25rem 0 0;

            font-family: $displayFont;
            font-size: 2rem;
            font-weight: 400;
            line-height: 1;
            color: $lightgray0;
            text-transform: uppercase;
            overflow-wrap: anywhere;
        }
    }

    &_header-actions {
        display: flex;
        flex: 0 0 auto;
        gap: 0.5rem;
        align-items: center;
    }

    &_section {
        padding: 1rem;
        border: 1px solid $darkgray800;
        border-radius: 12px;
        background: $darkgray950;

        > h3 {
            margin: 0 0 0.85rem;
            font-size: 0.95rem;
            color: $lightgray50;
        }
    }

    &_empty {
        margin: 0 0 0.75rem;
        font-size: 0.85rem;
        color: $lightgray300;
    }

    &_error {
        margin: 0;
        padding: 0.75rem;
        border: 1px solid $error500;
        border-radius: 8px;

        color: $error300;

        background: rgb(194 37 105 / 8%);
    }

    &_footer {
        display: flex;
        justify-content: flex-end;
    }
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    &--wide {
        grid-column: 1 / -1;
    }

    > span {
        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;

        small {
            font-weight: 400;
            color: $lightgray400;
        }
    }

    input,
    textarea {
        min-height: 42px;
        padding: 0.5rem 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    textarea {
        resize: vertical;
        line-height: 1.5;
    }
}

.slug-input {
    display: flex;
    align-items: center;

    > span {
        padding: 0 0.25rem 0 0.75rem;
        border: 1px solid $darkgray700;
        border-right: 0;
        border-radius: 8px 0 0 8px;

        line-height: 40px;
        color: $lightgray400;

        background: $darkgray950;
    }

    input {
        flex: 1;
        border-radius: 0 8px 8px 0;
    }
}

.block-card {
    margin-bottom: 0.6rem;
    border: 1px solid $darkgray800;
    border-radius: 10px;
    background: $darkgray900;

    summary {
        cursor: pointer;

        display: flex;
        gap: 0.75rem;
        align-items: center;

        padding: 0.65rem 0.85rem;

        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }

        &:focus-visible {
            border-radius: 10px;
            outline: 2px solid $primary400;
            outline-offset: -2px;
        }
    }

    &_type {
        flex: 0 0 auto;

        padding: 0.2rem 0.5rem;
        border: 1px solid $secondary600;
        border-radius: 999px;

        font-size: 0.68rem;
        font-weight: 700;
        color: $secondary300;
        white-space: nowrap;
    }

    &_title {
        overflow: hidden;
        flex: 1;

        font-size: 0.85rem;
        color: $lightgray150;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &_tools {
        display: flex;
        flex: 0 0 auto;
        gap: 0.3rem;
    }

    &_chevron {
        flex: 0 0 auto;

        width: 1.3rem;
        height: 1.3rem;

        color: $lightgray300;

        transition: transform 160ms ease;
    }

    &[open] &_chevron {
        transform: rotate(180deg);
    }

    &_body {
        padding: 0.85rem;
        border-top: 1px solid $darkgray800;
    }
}

.icon-button {
    cursor: pointer;

    display: grid;
    place-items: center;

    min-width: 36px;
    min-height: 36px;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    color: $lightgray200;

    background: transparent;

    &:disabled {
        cursor: default;
        opacity: 0.35;
    }

    &--danger:hover {
        color: $error300;
        background: rgb(194 37 105 / 8%);
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.ghost-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    min-height: 36px;
    padding: 0 0.7rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.8rem;
    color: $lightgray150;

    background: transparent;

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

.add-block {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;

    button {
        cursor: pointer;

        display: inline-flex;
        gap: 0.4rem;
        align-items: center;

        min-height: 42px;
        padding: 0 0.9rem;
        border: 1px dashed $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray200;

        background: transparent;

        &:hover {
            border-color: $secondary600;
            color: $secondary300;
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

.save-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 46px;
    padding: 0 1.25rem;
    border: 0;
    border-radius: 8px;

    font: inherit;
    font-weight: 700;
    color: $whiteOrig;

    background: $primary500;

    &:disabled {
        cursor: wait;
        opacity: 0.55;
    }

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }
}

@include mobileOnly {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .page-editor_header {
        flex-wrap: wrap;
    }
}
</style>
