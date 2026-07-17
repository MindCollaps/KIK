<template>
    <section class="site-panel">
        <header class="site-panel_intro">
            <div>
                <p>Struktur</p>
                <h1>Website</h1>
            </div>
            <div class="site-panel_transfer">
                <button type="button" class="ghost-button" @click="exportSite">
                    <Icon name="material-symbols:download-rounded" aria-hidden="true" />
                    Website exportieren
                </button>
                <label class="ghost-button">
                    <Icon name="material-symbols:upload-rounded" aria-hidden="true" />
                    Website importieren
                    <input type="file" accept="application/json,.json" @change="importSite">
                </label>
            </div>
        </header>

        <p v-if="message" class="site-panel_message" :class="{ 'site-panel_message--error': messageIsError }" role="alert">
            {{ message }}
        </p>

        <div v-if="navigation" class="site-panel_section">
            <div class="site-panel_section-head">
                <h2>Navigation</h2>
                <button type="button" class="save-button" :disabled="savingNavigation" @click="saveNavigation">
                    <Icon :name="savingNavigation ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                    Speichern
                </button>
            </div>
            <p class="site-panel_hint">Menüpunkte der Hauptnavigation in angezeigter Reihenfolge.</p>

            <div v-for="(item, index) in navigation.items" :key="index" class="item-row">
                <div class="item-row_fields">
                    <input v-model.trim="item.label" maxlength="60" placeholder="Bezeichnung">
                    <input v-model.trim="item.path" maxlength="1000" placeholder="/pfad">
                    <ui-icon-picker v-model="item.icon" />
                </div>
                <div class="item-row_tools">
                    <button type="button" class="icon-button" :disabled="index === 0" aria-label="Nach oben" @click="moveItem(navigation.items, index, -1)">
                        <Icon name="material-symbols:arrow-upward-rounded" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-button" :disabled="index === navigation.items.length - 1" aria-label="Nach unten" @click="moveItem(navigation.items, index, 1)">
                        <Icon name="material-symbols:arrow-downward-rounded" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-button icon-button--danger" aria-label="Menüpunkt entfernen" @click="navigation.items.splice(index, 1)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <button
                v-if="navigation.items.length < 12"
                type="button"
                class="add-button"
                @click="navigation.items.push({ label: '', path: '/', icon: null })"
            >
                <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                Menüpunkt hinzufügen
            </button>
        </div>

        <div v-if="footer" class="site-panel_section">
            <div class="site-panel_section-head">
                <h2>Footer</h2>
                <button type="button" class="save-button" :disabled="savingFooter" @click="saveFooter">
                    <Icon :name="savingFooter ? 'material-symbols:progress-activity' : 'material-symbols:save-rounded'" aria-hidden="true" />
                    Speichern
                </button>
            </div>

            <div class="form-grid">
                <label class="field field--wide">
                    <span>Beschreibung</span>
                    <textarea v-model.trim="footer.description" rows="2" maxlength="300" />
                </label>
                <label class="field">
                    <span>Adresse <small>optional</small></span>
                    <input v-model="footer.addressLabel" maxlength="200">
                </label>
                <label class="field">
                    <span>Adress-Link <small>optional</small></span>
                    <input v-model="footer.addressUrl" maxlength="1000" placeholder="https://maps.google.com/…">
                </label>
                <label class="field">
                    <span>Zeile unten links <small>Jahr wird automatisch ergänzt</small></span>
                    <input v-model.trim="footer.bottomLeft" maxlength="200">
                </label>
                <label class="field">
                    <span>Zeile unten rechts</span>
                    <input v-model.trim="footer.bottomRight" maxlength="200">
                </label>
            </div>

            <div v-for="(group, groupIndex) in footer.groups" :key="groupIndex" class="footer-group">
                <div class="footer-group_head">
                    <input v-model.trim="group.title" maxlength="60" placeholder="Spaltentitel">
                    <button type="button" class="icon-button icon-button--danger" aria-label="Spalte entfernen" @click="footer.groups.splice(groupIndex, 1)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </div>
                <div v-for="(link, linkIndex) in group.links" :key="linkIndex" class="item-row">
                    <div class="item-row_fields">
                        <input v-model.trim="link.label" maxlength="80" placeholder="Bezeichnung">
                        <input v-model.trim="link.to" maxlength="1000" placeholder="/pfad oder https://…">
                        <ui-icon-picker v-model="link.icon" />
                    </div>
                    <div class="item-row_tools">
                        <button type="button" class="icon-button icon-button--danger" aria-label="Link entfernen" @click="group.links.splice(linkIndex, 1)">
                            <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <button
                    v-if="group.links.length < 10"
                    type="button"
                    class="add-button"
                    @click="group.links.push({ label: '', to: '/', icon: null })"
                >
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Link hinzufügen
                </button>
            </div>
            <button
                v-if="footer.groups.length < 4"
                type="button"
                class="add-button"
                @click="footer.groups.push({ title: 'Neue Spalte', links: [] })"
            >
                <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                Spalte hinzufügen
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { FooterConfig, NavigationConfig } from '~~/types/content';
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';
import { clonePlain, downloadJson, normalizeContentValue } from '~/utils/content-blocks';

interface ApiError {
    data?: { statusMessage?: string };
}

const navigation = ref<NavigationConfig | null>(null);
const footer = ref<FooterConfig | null>(null);
const savingNavigation = ref(false);
const savingFooter = ref(false);
const message = ref('');
const messageIsError = ref(false);
const { showToast } = useToastManager();

loadSettings();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

function showMessage(text: string, isError = false) {
    message.value = text;
    messageIsError.value = isError;
}

async function loadSettings() {
    try {
        const [navigationResponse, footerResponse] = await Promise.all([
            $fetch<{ value: NavigationConfig }>('/api/admin/settings/navigation'),
            $fetch<{ value: FooterConfig }>('/api/admin/settings/footer'),
        ]);
        navigation.value = navigationResponse.value;
        footer.value = footerResponse.value;
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Die Einstellungen konnten nicht geladen werden.'), true);
    }
}

function moveItem<Item>(list: Item[], index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    if (item !== undefined) list.splice(target, 0, item);
}

async function saveNavigation() {
    if (!navigation.value) return;
    savingNavigation.value = true;
    try {
        await $fetch('/api/admin/settings/navigation', {
            method: 'PUT',
            body: normalizeContentValue(clonePlain(navigation.value)),
        });
        await refreshSiteConfig();
        showMessage('Die Navigation wurde gespeichert.');
        showToast({
            mode: ToastMode.Success,
            title: 'Gespeichert',
            message: 'Die Navigation wurde gespeichert.',
        });
    }
    catch (error: unknown) {
        const toastMessage = apiErrorMessage(error, 'Die Navigation konnte nicht gespeichert werden.');
        showMessage(toastMessage, true);
        showToast({
            mode: ToastMode.Error,
            title: 'Speichern fehlgeschlagen',
            message: toastMessage,
        });
    }
    finally {
        savingNavigation.value = false;
    }
}

async function saveFooter() {
    if (!footer.value) return;
    savingFooter.value = true;
    try {
        await $fetch('/api/admin/settings/footer', {
            method: 'PUT',
            body: normalizeContentValue(clonePlain(footer.value)),
        });
        await refreshSiteConfig();
        showMessage('Der Footer wurde gespeichert.');
        showToast({
            mode: ToastMode.Success,
            title: 'Gespeichert',
            message: 'Der Footer wurde gespeichert.',
        });
    }
    catch (error: unknown) {
        const toastMessage = apiErrorMessage(error, 'Der Footer konnte nicht gespeichert werden.');
        showMessage(toastMessage, true);
        showToast({
            mode: ToastMode.Error,
            title: 'Speichern fehlgeschlagen',
            message: toastMessage,
        });
    }
    finally {
        savingFooter.value = false;
    }
}

async function refreshSiteConfig() {
    await loadSiteConfig();
}

async function exportSite() {
    try {
        const payload = await $fetch('/api/admin/site-export');
        downloadJson(payload, `kik-website-${new Date().toISOString().slice(0, 10)}.json`);
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Der Export ist fehlgeschlagen.'), true);
    }
}

async function importSite(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!confirm('Der Import überschreibt Seiten mit gleichem Pfad sowie Navigation und Footer. Fortfahren?')) return;

    try {
        const parsed = JSON.parse(await file.text());
        const result = await $fetch<{ importedPages: number }>('/api/admin/site-import', { method: 'POST', body: parsed });
        await Promise.all([loadSettings(), refreshSiteConfig()]);
        showMessage(`Import abgeschlossen: ${result.importedPages} Seiten übernommen.`);
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, 'Der Import ist fehlgeschlagen. Ist die Datei ein gültiger Website-Export?'), true);
    }
}
</script>

<style scoped lang="scss">
.site-panel {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: clamp(1rem, 2.5vw, 2rem);

    &_intro {
        display: flex;
        flex-wrap: wrap;
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

    &_transfer {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    &_message {
        margin: 1rem 0 0;
        padding: 0.75rem;
        border: 1px solid $success400;
        border-radius: 8px;

        color: $success400;

        background: rgb(74 222 128 / 6%);

        &--error {
            border-color: $error500;
            color: $error300;
            background: rgb(194 37 105 / 8%);
        }
    }

    &_section {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid $darkgray800;
        border-radius: 12px;

        background: $darkgray950;
    }

    &_section-head {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;

        h2 {
            margin: 0;
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }

    &_hint {
        margin: 0.4rem 0 0.85rem;
        font-size: 0.8rem;
        color: $lightgray300;
    }
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 0.85rem 0;
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
}

.field input,
.field textarea,
.item-row_fields input,
.footer-group_head input {
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

.field textarea {
    resize: vertical;
    line-height: 1.5;
}

.item-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: start;

    margin-top: 0.5rem;
    padding: 0.6rem;
    border: 1px solid $darkgray800;
    border-radius: 8px;

    background: $darkgray900;

    &_fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.5rem;
    }

    &_tools {
        display: flex;
        gap: 0.3rem;
    }
}

.footer-group {
    margin-top: 1rem;
    padding: 0.75rem;
    border: 1px dashed $darkgray700;
    border-radius: 10px;

    &_head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.5rem;
    }
}

.icon-button {
    cursor: pointer;

    display: grid;
    place-items: center;

    min-width: 40px;
    min-height: 40px;
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

.add-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;

    min-height: 40px;
    margin-top: 0.6rem;
    padding: 0 0.8rem;
    border: 1px dashed $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.8rem;
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

.save-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;

    min-height: 42px;
    padding: 0 1rem;
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
}
</style>
