<template>
    <main class="storeadmin-page">
        <store-header title="Kassen-Verwaltung" />

        <div class="storeadmin-layout">
            <p v-if="message" class="storeadmin-message" :class="{ 'storeadmin-message--error': messageIsError }" role="alert">
                {{ message }}
            </p>

            <section class="storeadmin-section" aria-label="Sortiment">
                <header class="storeadmin-section_head">
                    <h2>Sortiment</h2>
                    <ui-checkbox v-model="showArchived" class="storeadmin-toggle">Archivierte anzeigen</ui-checkbox>
                </header>

                <form class="storeadmin-inline-form" @submit.prevent="createCategory">
                    <input v-model.trim="newCategoryName" required maxlength="60" placeholder="Neue Kategorie, z. B. Getränke">
                    <button type="submit" :disabled="pendingAction">Kategorie anlegen</button>
                </form>

                <article
                    v-for="category in visibleCategories"
                    :key="category.id"
                    class="storeadmin-category"
                    :class="{ 'storeadmin-category--archived': category.archived }"
                >
                    <header class="storeadmin-category_head">
                        <template v-if="editingCategoryId === category.id">
                            <div class="storeadmin-editform">
                                <input v-model.trim="categoryEditName" maxlength="60" class="storeadmin-category_edit" aria-label="Kategoriename">
                                <label class="storeadmin-color">
                                    <span>Farbe</span>
                                    <ui-input-color v-model="categoryEditColor" clearable />
                                </label>
                                <ui-icon-picker v-model="categoryEditIcon" class="storeadmin-iconpicker" />
                            </div>
                            <div class="storeadmin-row-actions">
                                <button type="button" @click="saveCategory(category)">Speichern</button>
                                <button type="button" class="storeadmin-row-actions_muted" @click="editingCategoryId = null">Abbrechen</button>
                            </div>
                        </template>
                        <template v-else>
                            <h3>
                                <span v-if="category.color" class="storeadmin-swatch" :style="{ backgroundColor: category.color }" aria-hidden="true" />
                                <Icon v-if="category.icon" :name="category.icon" aria-hidden="true" />
                                {{ category.name }}
                                <span v-if="category.archived" class="storeadmin-badge">Archiviert</span>
                            </h3>
                            <div class="storeadmin-row-actions">
                                <button type="button" :disabled="pendingAction" aria-label="Nach oben" @click="moveCategory(category, -1)">
                                    <Icon name="material-symbols:arrow-upward-rounded" aria-hidden="true" />
                                </button>
                                <button type="button" :disabled="pendingAction" aria-label="Nach unten" @click="moveCategory(category, 1)">
                                    <Icon name="material-symbols:arrow-downward-rounded" aria-hidden="true" />
                                </button>
                                <button type="button" @click="startCategoryEdit(category)">Bearbeiten</button>
                                <button type="button" class="storeadmin-row-actions_muted" @click="toggleCategoryArchived(category)">
                                    {{ category.archived ? 'Reaktivieren' : 'Archivieren' }}
                                </button>
                                <button
                                    v-if="category.archived"
                                    type="button"
                                    class="storeadmin-row-actions_danger"
                                    :disabled="pendingAction"
                                    @click="deleteCategory(category)"
                                >
                                    Löschen
                                </button>
                            </div>
                        </template>
                    </header>

                    <ul class="storeadmin-items">
                        <li
                            v-for="item in visibleItems(category)"
                            :key="item.id"
                            class="storeadmin-item"
                            :class="{ 'storeadmin-item--archived': item.archived }"
                        >
                            <template v-if="editingItemId === item.id">
                                <div class="storeadmin-item_edit">
                                    <input v-model.trim="itemEditName" maxlength="80" aria-label="Artikelname">
                                    <input v-model.trim="itemEditPrice" :disabled="itemEditFreePrice" inputmode="decimal" placeholder="Preis, z. B. 4,00" aria-label="Preis in Euro">
                                    <ui-checkbox v-model="itemEditFreePrice">Freier Preis</ui-checkbox>
                                    <ui-select v-model="itemEditPoolId" aria-label="Nummernpool">
                                        <option value="">Kein Nummernpool</option>
                                        <option v-for="pool in pools" :key="pool.id" :value="pool.id">{{ pool.name }}</option>
                                    </ui-select>
                                    <label class="storeadmin-color">
                                        <span>Farbe</span>
                                        <ui-input-color v-model="itemEditColor" clearable />
                                    </label>
                                </div>
                                <div class="storeadmin-row-actions">
                                    <button type="button" @click="saveItem(item)">Speichern</button>
                                    <button type="button" class="storeadmin-row-actions_muted" @click="editingItemId = null">Abbrechen</button>
                                </div>
                            </template>
                            <template v-else>
                                <div class="storeadmin-item_info">
                                    <strong>
                                        <span v-if="item.color" class="storeadmin-swatch" :style="{ backgroundColor: item.color }" aria-hidden="true" />
                                        {{ item.name }}
                                    </strong>
                                    <span>
                                        {{ item.freePrice ? 'Freier Preis' : formatCents(item.priceCents) }}
                                        <template v-if="item.numberPool"> · Pool „{{ item.numberPool.name }}“ ({{ item.numberPool.nextNumber === null ? 'keine Start-Nr.' : `nächste Nr. ${item.numberPool.nextNumber}` }})</template>
                                        <template v-if="item.archived"> · Archiviert</template>
                                    </span>
                                </div>
                                <div class="storeadmin-row-actions">
                                    <button type="button" :disabled="pendingAction" aria-label="Nach oben" @click="moveItem(category, item, -1)">
                                        <Icon name="material-symbols:arrow-upward-rounded" aria-hidden="true" />
                                    </button>
                                    <button type="button" :disabled="pendingAction" aria-label="Nach unten" @click="moveItem(category, item, 1)">
                                        <Icon name="material-symbols:arrow-downward-rounded" aria-hidden="true" />
                                    </button>
                                    <button type="button" @click="startItemEdit(item)">Bearbeiten</button>
                                    <button type="button" class="storeadmin-row-actions_muted" @click="toggleItemArchived(item)">
                                        {{ item.archived ? 'Reaktivieren' : 'Archivieren' }}
                                    </button>
                                    <button
                                        v-if="item.archived"
                                        type="button"
                                        class="storeadmin-row-actions_danger"
                                        :disabled="pendingAction"
                                        @click="deleteItem(item)"
                                    >
                                        Löschen
                                    </button>
                                </div>
                            </template>
                        </li>
                    </ul>

                    <form class="storeadmin-inline-form storeadmin-inline-form--item" @submit.prevent="createItem(category)">
                        <input v-model.trim="newItem[category.id]!.name" required maxlength="80" placeholder="Neuer Artikel, z. B. Kinoticket">
                        <input
                            v-model.trim="newItem[category.id]!.price"
                            :disabled="newItem[category.id]!.freePrice"
                            inputmode="decimal"
                            :required="!newItem[category.id]!.freePrice"
                            placeholder="Preis, z. B. 4,00"
                        >
                        <ui-checkbox v-model="newItem[category.id]!.freePrice" class="storeadmin-toggle">Freier Preis</ui-checkbox>
                        <ui-select v-model="newItem[category.id]!.numberPoolId" aria-label="Nummernpool">
                            <option value="">Kein Nummernpool</option>
                            <option v-for="pool in pools" :key="pool.id" :value="pool.id">{{ pool.name }}</option>
                        </ui-select>
                        <button type="submit" :disabled="pendingAction">Hinzufügen</button>
                    </form>
                </article>
            </section>

            <section class="storeadmin-section" aria-label="Nummernpools">
                <header class="storeadmin-section_head">
                    <h2>Nummernpools</h2>
                </header>
                <p class="storeadmin-hint">
                    Artikel im selben Pool teilen sich einen fortlaufenden Nummernkreis –
                    z. B. Kinokarten normal und ermäßigt vom selben Kartenblock.
                </p>

                <form class="storeadmin-inline-form" @submit.prevent="createPool">
                    <input v-model.trim="newPoolName" required maxlength="60" placeholder="Neuer Pool, z. B. Kinokarten">
                    <input v-model.trim="newPoolNumber" inputmode="numeric" placeholder="Startnummer (optional)">
                    <button type="submit" :disabled="pendingAction">Pool anlegen</button>
                </form>

                <p v-if="!pools.length" class="storeadmin-hint">Noch keine Pools angelegt.</p>
                <ul v-else class="storeadmin-items">
                    <li v-for="pool in pools" :key="pool.id" class="storeadmin-item">
                        <template v-if="editingPoolId === pool.id">
                            <div class="storeadmin-item_edit">
                                <input v-model.trim="poolEditName" maxlength="60" aria-label="Poolname">
                                <input v-model.trim="poolEditNumber" inputmode="numeric" placeholder="Nächste Nr., z. B. 1001" aria-label="Nächste Nummer">
                            </div>
                            <div class="storeadmin-row-actions">
                                <button type="button" @click="savePool(pool)">Speichern</button>
                                <button type="button" class="storeadmin-row-actions_muted" @click="editingPoolId = null">Abbrechen</button>
                            </div>
                        </template>
                        <template v-else>
                            <div class="storeadmin-item_info">
                                <strong>{{ pool.name }}</strong>
                                <span>
                                    {{ pool.nextNumber === null ? 'Keine Startnummer' : `Nächste Nr. ${pool.nextNumber}` }}
                                    · {{ pool.itemCount }} Artikel zugeordnet
                                </span>
                            </div>
                            <div class="storeadmin-row-actions">
                                <button type="button" @click="startPoolEdit(pool)">Bearbeiten</button>
                                <button
                                    type="button"
                                    class="storeadmin-row-actions_danger"
                                    :disabled="pendingAction || pool.itemCount > 0"
                                    :title="pool.itemCount > 0 ? 'Der Pool ist noch Artikeln zugeordnet.' : undefined"
                                    @click="deletePool(pool)"
                                >
                                    Löschen
                                </button>
                            </div>
                        </template>
                    </li>
                </ul>
            </section>

            <section class="storeadmin-section" aria-label="Tagesabschluss">
                <header class="storeadmin-section_head">
                    <h2>Tagesabschluss</h2>
                </header>
                <p class="storeadmin-abschluss-hint">
                    Der Tagesabschluss hat jetzt eine eigene Seite.
                </p>
                <nuxt-link to="/store/tagesabschluss/neu" class="storeadmin-abschluss-link">
                    <Icon name="material-symbols:receipt-long-rounded" aria-hidden="true" />
                    Zum Tagesabschluss
                </nuxt-link>
            </section>
        </div>
    </main>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import type { NumberPoolRecord, StoreCategoryRecord, StoreItemRecord } from '~~/types/store';
import { requireStorePermission } from '~/composables/storeAccess';
import { usePageSeo } from '~/composables/seo';
import { formatCents, parseEuroInput } from '~/utils/currency';

definePageMeta({ layout: 'empty' });
usePageSeo(() => ({ title: 'Kassen-Verwaltung', noindex: true }));

await requireStorePermission(Permission.KasseManage);

interface ApiError {
    data?: { statusMessage?: string };
}

interface NewItemForm {
    name: string;
    price: string;
    freePrice: boolean;
    numberPoolId: string;
}

interface PoolEntry extends NumberPoolRecord {
    itemCount: number;
}

const requestFetch = useRequestFetch();
const [catalogResponse, poolsResponse] = await Promise.all([
    requestFetch<{ categories: StoreCategoryRecord[] }>('/api/store/catalog?all=true'),
    requestFetch<{ pools: PoolEntry[] }>('/api/store/pools'),
]);

const categories = ref(catalogResponse.categories);
const pools = ref(poolsResponse.pools);
const showArchived = ref(false);
const pendingAction = ref(false);
const message = ref('');
const messageIsError = ref(false);

const newCategoryName = ref('');
const newItem = ref<Record<string, NewItemForm>>({});
ensureItemForms();

const editingCategoryId = ref<string | null>(null);
const categoryEditName = ref('');
const categoryEditColor = ref('');
const categoryEditIcon = ref('');
const editingItemId = ref<string | null>(null);
const itemEditName = ref('');
const itemEditPrice = ref('');
const itemEditFreePrice = ref(false);
const itemEditPoolId = ref('');
const itemEditColor = ref('');

const newPoolName = ref('');
const newPoolNumber = ref('');
const editingPoolId = ref<string | null>(null);
const poolEditName = ref('');
const poolEditNumber = ref('');

const visibleCategories = computed(() => showArchived.value ? categories.value : categories.value.filter(category => !category.archived));

function ensureItemForms() {
    for (const category of categories.value) {
        newItem.value[category.id] ??= { name: '', price: '', freePrice: false, numberPoolId: '' };
    }
}

function visibleItems(category: StoreCategoryRecord) {
    return showArchived.value ? category.items : category.items.filter(item => !item.archived);
}

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

function showMessage(text: string, isError = false) {
    message.value = text;
    messageIsError.value = isError;
}

async function reloadCatalog() {
    const response = await $fetch<{ categories: StoreCategoryRecord[] }>('/api/store/catalog?all=true');
    categories.value = response.categories;
    ensureItemForms();
}

async function runAction(action: () => Promise<void>, fallbackError: string) {
    // Schützt vor doppelter Ausführung (z. B. zweimal Enter, bevor der Button deaktiviert ist)
    if (pendingAction.value) return;
    pendingAction.value = true;
    message.value = '';
    try {
        await action();
    }
    catch (error: unknown) {
        showMessage(apiErrorMessage(error, fallbackError), true);
    }
    finally {
        pendingAction.value = false;
    }
}

async function createCategory() {
    await runAction(async () => {
        await $fetch('/api/store/categories', { method: 'POST', body: { name: newCategoryName.value } });
        newCategoryName.value = '';
        await reloadCatalog();
    }, 'Die Kategorie konnte nicht angelegt werden.');
}

function startCategoryEdit(category: StoreCategoryRecord) {
    editingCategoryId.value = category.id;
    categoryEditName.value = category.name;
    categoryEditColor.value = category.color ?? '';
    categoryEditIcon.value = category.icon ?? '';
}

async function saveCategory(category: StoreCategoryRecord) {
    await runAction(async () => {
        await $fetch(`/api/store/categories/${category.id}`, {
            method: 'PUT',
            body: {
                name: categoryEditName.value,
                color: categoryEditColor.value || null,
                icon: categoryEditIcon.value || null,
            },
        });
        editingCategoryId.value = null;
        await reloadCatalog();
    }, 'Die Kategorie konnte nicht gespeichert werden.');
}

async function moveCategory(category: StoreCategoryRecord, delta: number) {
    const ids = categories.value.map(entry => entry.id);
    const index = ids.indexOf(category.id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];

    await runAction(async () => {
        await $fetch('/api/store/categories-reorder', { method: 'POST', body: { ids } });
        await reloadCatalog();
    }, 'Die Reihenfolge konnte nicht gespeichert werden.');
}

async function moveItem(category: StoreCategoryRecord, item: StoreItemRecord, delta: number) {
    const ids = category.items.map(entry => entry.id);
    const index = ids.indexOf(item.id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];

    await runAction(async () => {
        await $fetch('/api/store/items-reorder', { method: 'POST', body: { ids } });
        await reloadCatalog();
    }, 'Die Reihenfolge konnte nicht gespeichert werden.');
}

async function toggleCategoryArchived(category: StoreCategoryRecord) {
    await runAction(async () => {
        await $fetch(`/api/store/categories/${category.id}`, { method: 'PUT', body: { archived: !category.archived } });
        await reloadCatalog();
    }, 'Die Kategorie konnte nicht geändert werden.');
}

async function deleteCategory(category: StoreCategoryRecord) {
    if (!confirm(`Kategorie „${category.name}“ endgültig löschen?`)) return;
    await runAction(async () => {
        await $fetch(`/api/store/categories/${category.id}`, { method: 'DELETE' });
        await reloadCatalog();
    }, 'Die Kategorie konnte nicht gelöscht werden.');
}

async function createItem(category: StoreCategoryRecord) {
    const form = newItem.value[category.id];
    if (!form) return;

    let priceCents = 0;
    if (!form.freePrice) {
        const parsed = parseEuroInput(form.price);
        if (parsed === null) {
            showMessage('Bitte gib einen gültigen Preis ein, z. B. 4,00.', true);
            return;
        }
        priceCents = parsed;
    }

    await runAction(async () => {
        await $fetch('/api/store/items', {
            method: 'POST',
            body: { categoryId: category.id, name: form.name, priceCents, freePrice: form.freePrice, numberPoolId: form.numberPoolId || null },
        });
        newItem.value[category.id] = { name: '', price: '', freePrice: false, numberPoolId: '' };
        await Promise.all([reloadCatalog(), reloadPools()]);
    }, 'Der Artikel konnte nicht angelegt werden.');
}

function startItemEdit(item: StoreItemRecord) {
    editingItemId.value = item.id;
    itemEditName.value = item.name;
    itemEditPrice.value = item.freePrice ? '' : (item.priceCents / 100).toFixed(2).replace('.', ',');
    itemEditFreePrice.value = item.freePrice;
    itemEditPoolId.value = item.numberPoolId ?? '';
    itemEditColor.value = item.color ?? '';
}

async function saveItem(item: StoreItemRecord) {
    let priceCents = 0;
    if (!itemEditFreePrice.value) {
        const parsed = parseEuroInput(itemEditPrice.value);
        if (parsed === null) {
            showMessage('Bitte gib einen gültigen Preis ein, z. B. 4,00.', true);
            return;
        }
        priceCents = parsed;
    }

    await runAction(async () => {
        await $fetch(`/api/store/items/${item.id}`, {
            method: 'PUT',
            body: {
                name: itemEditName.value,
                priceCents,
                freePrice: itemEditFreePrice.value,
                numberPoolId: itemEditPoolId.value || null,
                color: itemEditColor.value || null,
            },
        });
        editingItemId.value = null;
        await Promise.all([reloadCatalog(), reloadPools()]);
    }, 'Der Artikel konnte nicht gespeichert werden.');
}

async function reloadPools() {
    const response = await $fetch<{ pools: PoolEntry[] }>('/api/store/pools');
    pools.value = response.pools;
}

// Wandelt eine Nummerneingabe in eine Zahl um; leer = null, ungültig = undefined
function parsePoolNumberInput(value: string): number | null | undefined {
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

async function createPool() {
    const nextNumber = parsePoolNumberInput(newPoolNumber.value);
    if (nextNumber === undefined) {
        showMessage('Bitte gib eine gültige Startnummer ein, z. B. 1001.', true);
        return;
    }

    await runAction(async () => {
        await $fetch('/api/store/pools', { method: 'POST', body: { name: newPoolName.value, nextNumber } });
        newPoolName.value = '';
        newPoolNumber.value = '';
        await reloadPools();
    }, 'Der Nummernpool konnte nicht angelegt werden.');
}

function startPoolEdit(pool: PoolEntry) {
    editingPoolId.value = pool.id;
    poolEditName.value = pool.name;
    poolEditNumber.value = pool.nextNumber === null ? '' : String(pool.nextNumber);
}

async function savePool(pool: PoolEntry) {
    const nextNumber = parsePoolNumberInput(poolEditNumber.value);
    if (nextNumber === undefined) {
        showMessage('Bitte gib eine gültige nächste Nummer ein, z. B. 1001.', true);
        return;
    }

    await runAction(async () => {
        await $fetch(`/api/store/pools/${pool.id}`, {
            method: 'PUT',
            body: { name: poolEditName.value, nextNumber },
        });
        editingPoolId.value = null;
        await Promise.all([reloadPools(), reloadCatalog()]);
    }, 'Der Nummernpool konnte nicht gespeichert werden.');
}

async function deletePool(pool: PoolEntry) {
    if (!confirm(`Nummernpool „${pool.name}“ endgültig löschen?`)) return;
    await runAction(async () => {
        await $fetch(`/api/store/pools/${pool.id}`, { method: 'DELETE' });
        await reloadPools();
    }, 'Der Nummernpool konnte nicht gelöscht werden.');
}

async function toggleItemArchived(item: StoreItemRecord) {
    await runAction(async () => {
        await $fetch(`/api/store/items/${item.id}`, { method: 'PUT', body: { archived: !item.archived } });
        await reloadCatalog();
    }, 'Der Artikel konnte nicht geändert werden.');
}

async function deleteItem(item: StoreItemRecord) {
    if (!confirm(`Artikel „${item.name}“ endgültig löschen?`)) return;
    await runAction(async () => {
        await $fetch(`/api/store/items/${item.id}`, { method: 'DELETE' });
        await reloadCatalog();
    }, 'Der Artikel konnte nicht gelöscht werden.');
}

</script>

<style scoped lang="scss">
.storeadmin-page {
    min-height: 100dvh;
    color: $lightgray150;
    background: $darkgray1000;
}

.storeadmin-layout {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 1.25rem;
}

.storeadmin-message {
    margin: 0 0 1rem;
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

.storeadmin-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid $darkgray800;
    border-radius: 12px;

    background: $darkgray950;

    &_head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.85rem;

        h2 {
            margin: 0;
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }
}

.storeadmin-toggle {
    font-size: 0.78rem;
    color: $lightgray300;
}

.storeadmin-hint {
    margin: 0 0 0.85rem;
    font-size: 0.8rem;
    color: $lightgray300;
}

.storeadmin-inline-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;

    margin-bottom: 1rem;

    input:not([type='checkbox']) {
        flex: 1;

        min-width: 10rem;
        min-height: 42px;
        padding: 0 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        background: $darkgray900;
        outline: none;

        &:disabled {
            opacity: 0.45;
        }

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    button {
        cursor: pointer;

        min-height: 42px;
        padding: 0 0.9rem;
        border: 0;
        border-radius: 8px;

        font: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        color: $whiteOrig;

        background: $primary500;

        &:disabled {
            cursor: wait;
            opacity: 0.55;
        }

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 2px;
        }
    }

    &--item {
        margin: 0.6rem 0 0;

        input:not([type='checkbox']) {
            min-width: 8rem;
        }
    }
}

.storeadmin-category {
    margin-bottom: 1rem;
    padding: 0.85rem;
    border: 1px solid $darkgray800;
    border-radius: 10px;

    background: $darkgray900;

    &--archived {
        opacity: 0.6;
    }

    &_head {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 0.5rem;

        h3 {
            display: inline-flex;
            gap: 0.5rem;
            align-items: center;

            margin: 0;

            font-size: 0.95rem;
            color: $lightgray0;

            svg {
                width: 1.1rem;
                height: 1.1rem;
                color: $secondary300;
            }
        }
    }

    &_edit {
        flex: 1;

        min-width: 10rem;
        min-height: 40px;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        color: $lightgray50;

        background: $darkgray950;
    }
}

.storeadmin-editform {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
}

.storeadmin-iconpicker {
    min-width: 14rem;
}

.storeadmin-color {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    font-size: 0.75rem;
    color: $lightgray300;
}

.storeadmin-swatch {
    display: inline-block;

    width: 0.85rem;
    height: 0.85rem;
    border: 1px solid rgb(255 255 255 / 25%);
    border-radius: 4px;
}

.storeadmin-badge {
    padding: 0.1rem 0.45rem;
    border: 1px solid $darkgray600;
    border-radius: 999px;

    font-size: 0.65rem;
    color: $lightgray400;
}

.storeadmin-items {
    display: grid;
    gap: 0.4rem;

    margin: 0;
    padding: 0;

    list-style: none;
}

.storeadmin-item {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;

    padding: 0.5rem 0.65rem;
    border: 1px solid $darkgray850;
    border-radius: 8px;

    background: $darkgray950;

    &--archived {
        opacity: 0.55;
    }

    &_info {
        display: grid;
        min-width: 0;

        strong {
            font-size: 0.85rem;
            color: $lightgray50;
        }

        span {
            font-size: 0.75rem;
            color: $secondary300;
        }
    }

    &_edit {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;

        input:not([type='checkbox']) {
            flex: 1;

            min-width: 7rem;
            min-height: 38px;
            padding: 0 0.6rem;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            font: inherit;
            font-size: 0.82rem;
            color: $lightgray50;

            background: $darkgray900;

            &:disabled {
                opacity: 0.45;
            }
        }
    }
}

.storeadmin-row-actions {
    display: inline-flex;
    gap: 0.35rem;

    button {
        cursor: pointer;

        min-height: 34px;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.75rem;
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

    &_muted {
        color: $lightgray400 !important;
    }

    &_danger {
        border-color: $error500 !important;
        color: $error300 !important;
    }
}

.storeadmin-abschluss-hint {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: $lightgray300;
}

.storeadmin-abschluss-link {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 46px;
    padding: 0 1rem;
    border-radius: 8px;

    font-weight: 700;
    color: $whiteOrig;
    text-decoration: none;

    background: $primary500;

    svg {
        width: 1.1rem;
        height: 1.1rem;
    }

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }
}

@include mobileOnly {
    .storeadmin-layout {
        padding: 0.9rem;
    }
}
</style>
