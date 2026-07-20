<template>
    <main class="pos-page">
        <store-header title="Kasse" />
        <views-view-version/>

        <div class="pos-layout">
            <section class="pos-catalog" aria-label="Artikel">
                <div v-if="categories.length" class="pos-mode" role="group" aria-label="Ansicht">
                    <ui-button
                        class="pos-mode_button"
                        tag="button"
                        type="pill"
                        :active="viewMode === 'open'"
                        @click="setViewMode('open')"
                    >
                        <Icon name="material-symbols:grid-view-rounded" aria-hidden="true" />
                        Alle Artikel
                    </ui-button>
                    <ui-button
                        class="pos-mode_button"
                        tag="button"
                        type="pill"
                        :active="viewMode === 'grouped'"
                        @click="setViewMode('grouped')"
                    >
                        <Icon name="material-symbols:category-rounded" aria-hidden="true" />
                        Kategorien
                    </ui-button>
                </div>

                <p v-if="!categories.length" class="pos-empty">
                    Es sind noch keine Artikel angelegt. Artikel können in der Kassen-Verwaltung angelegt werden.
                </p>

                <template v-else-if="viewMode === 'grouped'">
                    <nav v-if="categories.length > 1" class="pos-tabs" aria-label="Kategorien">
                        <ui-button
                            v-for="category in categories"
                            :key="category.id"
                            class="pos-tabs_button"
                            tag="button"
                            type="pill"
                            :active="activeCategoryId === category.id"
                            @click="activeCategoryId = category.id"
                        >
                            <Icon v-if="category.icon" :name="category.icon" aria-hidden="true" />
                            {{ category.name }}
                        </ui-button>
                    </nav>

                    <div class="pos-grid">
                        <div v-for="item in activeItems" :key="item.id" class="pos-item-wrap">
                            <ui-button
                                class="pos-item"
                                :class="{ 'pos-item--colored': item.color }"
                                :style="itemStyle(item)"
                                tag="button"
                                type="secondary"
                                @click="addItem(item)"
                            >
                                <strong>{{ item.name }}</strong>
                                <span>{{ item.freePrice ? 'Freier Preis' : formatCents(item.priceCents) }}</span>
                                <span v-if="item.numberPool" class="pos-item_number">{{ nextNumberLabel(item.numberPool) }}</span>
                            </ui-button>
                            <ui-button
                                v-if="item.numberPool"
                                class="pos-item_numedit"
                                :aria-label="`Startnummer für Pool ${item.numberPool.name} festlegen`"
                                tag="button"
                                type="secondary"
                                @click="openNumberModal(item.numberPool)"
                            >
                                <Icon name="material-symbols:edit-rounded" aria-hidden="true" />
                            </ui-button>
                        </div>
                    </div>
                </template>

                <template v-else>
                    <section
                        v-for="category in categories"
                        :key="category.id"
                        class="pos-open-category"
                        :class="{ 'pos-open-category--colored': category.color }"
                        :style="categoryStyle(category)"
                        :aria-label="category.name"
                    >
                        <header class="pos-open-category_head">
                            <Icon v-if="category.icon" :name="category.icon" aria-hidden="true" />
                            <h3>{{ category.name }}</h3>
                        </header>
                        <div class="pos-grid">
                            <div v-for="item in category.items" :key="item.id" class="pos-item-wrap">
                                <ui-button
                                    class="pos-item"
                                    :class="{ 'pos-item--colored': item.color }"
                                    :style="itemStyle(item)"
                                    tag="button"
                                    type="secondary"
                                    @click="addItem(item)"
                                >
                                    <strong>{{ item.name }}</strong>
                                    <span>{{ item.freePrice ? 'Freier Preis' : formatCents(item.priceCents) }}</span>
                                    <span v-if="item.numberPool" class="pos-item_number">{{ nextNumberLabel(item.numberPool) }}</span>
                                </ui-button>
                                <ui-button
                                    v-if="item.numberPool"
                                    class="pos-item_numedit"
                                    :aria-label="`Startnummer für Pool ${item.numberPool.name} festlegen`"
                                    tag="button"
                                    type="secondary"
                                    @click="openNumberModal(item.numberPool)"
                                >
                                    <Icon name="material-symbols:edit-rounded" aria-hidden="true" />
                                </ui-button>
                            </div>
                        </div>
                    </section>
                </template>

                <section class="pos-recent" aria-label="Letzte Bons">
                    <h2>Letzte Bons</h2>
                    <p v-if="!recentBons.length" class="pos-empty">Noch keine Bons in dieser Periode.</p>
                    <ul v-else class="pos-recent_list">
                        <li v-for="bon in recentBons" :key="bon.number" class="pos-recent_row" :class="{ 'pos-recent_row--cancelled': bon.status === 'CANCELLED' }">
                            <div class="pos-recent_main">
                                <strong>Bon #{{ bon.number }}</strong>
                                <span>{{ formatTime(bon.createdAt) }} · {{ paymentMethodLabels[bon.paymentMethod] }} · {{ formatCents(bon.totalCents) }}</span>
                                <span class="pos-recent_items">{{ bon.items.map(bonLineLabel).join(', ') }}</span>
                                <span v-if="bon.status === 'CANCELLED'" class="pos-recent_storno">
                                    Storniert{{ bon.cancelledByName ? ` von ${bon.cancelledByName}` : '' }}: {{ bon.cancelReason }}
                                </span>
                            </div>
                            <ui-button
                                v-if="bon.status === 'COMPLETED'"
                                class="pos-recent_cancel"
                                tag="button"
                                type="secondary"
                                @click="stornoTarget = bon"
                            >
                                Storno
                            </ui-button>
                        </li>
                    </ul>
                </section>
            </section>

            <aside class="pos-cart" aria-label="Aktueller Bon">
                <h2>Aktueller Bon</h2>

                <p v-if="lastBon" class="pos-cart_last" role="status">
                    Bon #{{ lastBon.number }} gespeichert · {{ formatCents(lastBon.totalCents) }} ({{ paymentMethodLabels[lastBon.paymentMethod] }})
                </p>
                <p v-if="errorMessage" class="pos-cart_error" role="alert">{{ errorMessage }}</p>

                <p v-if="!cart.length" class="pos-empty">Tippe auf Artikel, um sie hinzuzufügen.</p>
                <ul v-else class="pos-cart_list">
                    <li v-for="line in cart" :key="line.key" class="pos-cart_line">
                        <div class="pos-cart_line-info">
                            <strong>{{ line.name }}</strong>
                            <span>{{ formatCents(line.unitPriceCents) }}<template v-if="cartLineNumbers(line)"> · {{ cartLineNumbers(line) }}</template></span>
                        </div>
                        <div class="pos-cart_line-controls">
                            <ui-button tag="button" type="secondary" :aria-label="`${line.name} verringern`" @click="changeQuantity(line, -1)">−</ui-button>
                            <span>{{ line.quantity }}</span>
                            <ui-button tag="button" type="secondary" :aria-label="`${line.name} erhöhen`" @click="changeQuantity(line, 1)">+</ui-button>
                        </div>
                        <span class="pos-cart_line-total">{{ formatCents(line.unitPriceCents * line.quantity) }}</span>
                    </li>
                </ul>

                <div class="pos-cart_total">
                    <span>Gesamt</span>
                    <strong>{{ formatCents(totalCents) }}</strong>
                </div>

                <div class="pos-cart_payment" role="group" aria-label="Zahlungsart">
                    <ui-button
                        v-for="method in paymentMethods"
                        :key="method"
                        class="pos-cart_payment-button"
                        tag="button"
                        type="pill"
                        :active="paymentMethod === method"
                        @click="paymentMethod = method"
                    >
                        <Icon :name="method === 'CASH' ? 'material-symbols:euro-rounded' : 'material-symbols:credit-card-outline'" aria-hidden="true" />
                        {{ paymentMethodLabels[method] }}
                    </ui-button>
                </div>

                <ui-button
                    class="pos-cart_checkout"
                    tag="button"
                    :disabled="!cart.length || checkoutPending"
                    @click="checkout"
                >
                    <Icon :name="checkoutPending ? 'material-symbols:progress-activity' : 'material-symbols:receipt-rounded'" aria-hidden="true" />
                    {{ checkoutPending ? 'Wird gespeichert …' : 'Abrechnung' }}
                </ui-button>
                <ui-button v-if="cart.length" tag="button" type="secondary" class="pos-cart_clear" @click="cart = []">
                    Bon verwerfen
                </ui-button>
            </aside>
        </div>

        <div v-if="priceItem" class="pos-modal" role="dialog" aria-modal="true" :aria-label="`Preis für ${priceItem.name}`">
            <div class="pos-modal_box">
                <h3>Preis für „{{ priceItem.name }}“</h3>
                <label class="pos-modal_field">
                    <span>Betrag in Euro</span>
                    <input
                        ref="priceInputRef"
                        v-model="priceInput"
                        inputmode="decimal"
                        placeholder="z. B. 2,50"
                        @keyup.enter="confirmPrice"
                    >
                </label>
                <p v-if="priceError" class="pos-modal_error" role="alert">{{ priceError }}</p>
                <div class="pos-modal_actions">
                    <ui-button tag="button" type="secondary" class="pos-modal_secondary" @click="priceItem = null">Abbrechen</ui-button>
                    <ui-button tag="button" class="pos-modal_primary" @click="confirmPrice">Hinzufügen</ui-button>
                </div>
            </div>
        </div>

        <div v-if="numberPool" class="pos-modal" role="dialog" aria-modal="true" :aria-label="`Nummer für ${numberPool.name}`">
            <div class="pos-modal_box">
                <h3>Nächste Nummer für „{{ numberPool.name }}“</h3>
                <p class="pos-modal_hint">
                    Trage die Nummer der nächsten zu verkaufenden Karte ein (z. B. die erste Kartennummer des Tages).
                </p>
                <label class="pos-modal_field">
                    <span>Nächste Nummer</span>
                    <input
                        ref="numberInputRef"
                        v-model.trim="numberInput"
                        inputmode="numeric"
                        placeholder="z. B. 1001"
                        @keyup.enter="confirmNumber"
                    >
                </label>
                <p v-if="numberConflict" class="pos-modal_conflict" role="alert">
                    Eine andere Kasse hat den Stand inzwischen auf
                    {{ numberConflict.nextNumber === null ? 'keine Startnummer' : numberConflict.nextNumber }}
                    geändert.
                    <button type="button" class="pos-modal_conflict-action" @click="acceptFreshNumber">Aktuellen Wert übernehmen</button>
                </p>
                <p v-if="numberError" class="pos-modal_error" role="alert">{{ numberError }}</p>
                <div class="pos-modal_actions">
                    <ui-button tag="button" type="secondary" class="pos-modal_secondary" @click="closeNumberModal">Abbrechen</ui-button>
                    <ui-button tag="button" class="pos-modal_primary" :disabled="numberPending" @click="confirmNumber">
                        {{ numberPending ? 'Wird gespeichert …' : 'Speichern' }}
                    </ui-button>
                </div>
            </div>
        </div>

        <div v-if="stornoTarget" class="pos-modal" role="dialog" aria-modal="true" :aria-label="`Bon ${stornoTarget.number} stornieren`">
            <div class="pos-modal_box">
                <h3>Bon #{{ stornoTarget.number }} stornieren</h3>
                <p class="pos-modal_hint">
                    {{ formatCents(stornoTarget.totalCents) }} · {{ stornoTarget.items.map(line => `${line.quantity}× ${line.name}`).join(', ') }}
                </p>
                <label class="pos-modal_field">
                    <span>Stornogrund (Pflicht)</span>
                    <input v-model.trim="stornoReason" minlength="3" maxlength="300" placeholder="z. B. Kunde wollte nur eine Cola">
                </label>
                <p v-if="stornoError" class="pos-modal_error" role="alert">{{ stornoError }}</p>
                <div class="pos-modal_actions">
                    <ui-button tag="button" type="secondary" class="pos-modal_secondary" @click="closeStorno">Abbrechen</ui-button>
                    <ui-button tag="button" type="secondary" class="pos-modal_danger" :disabled="stornoPending" @click="confirmStorno">
                        {{ stornoPending ? 'Wird storniert …' : 'Stornieren' }}
                    </ui-button>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import type { BonRecord, NumberPoolRecord, StoreCategoryRecord, StoreItemRecord } from '~~/types/store';
import { PaymentMethod, paymentMethodLabels } from '~~/types/store';
import { requireStorePermission } from '~/composables/storeAccess';
import { usePageSeo } from '~/composables/seo';
import { contrastTextColor } from '~/utils/colors';
import { formatCents, parseEuroInput } from '~/utils/currency';

definePageMeta({ layout: 'empty' });
usePageSeo(() => ({ title: 'Kasse', noindex: true }));

await requireStorePermission(Permission.KasseUse);

interface ApiError {
    data?: {
        statusMessage?: string;
        statusCode?: number;
        data?: { pool?: { nextNumber: number | null; updatedAt: string } };
    };
}

interface CartLine {
    key: string;
    itemId: string;
    name: string;
    unitPriceCents: number;
    freePrice: boolean;
    quantity: number;
}

const requestFetch = useRequestFetch();
const catalogResponse = await requestFetch<{ categories: StoreCategoryRecord[] }>('/api/store/catalog');

// Artikel desselben Pools sollen dasselbe Pool-Objekt referenzieren,
// damit eine Nummernänderung überall sofort sichtbar ist
const rawPools = new Map<string, NumberPoolRecord>();
for (const category of catalogResponse.categories) {
    for (const item of category.items) {
        if (!item.numberPool) continue;
        const cached = rawPools.get(item.numberPool.id);
        if (cached) item.numberPool = cached;
        else rawPools.set(item.numberPool.id, item.numberPool);
    }
}

const categories = ref(catalogResponse.categories.filter(category => category.items.length > 0));

// Erst nach dem ref() aufsammeln, damit die Map die reaktiven Proxies enthält
const poolInstances = new Map<string, NumberPoolRecord>();
for (const category of categories.value) {
    for (const item of category.items) {
        if (item.numberPool) poolInstances.set(item.numberPool.id, item.numberPool);
    }
}
const activeCategoryId = ref(categories.value[0]?.id ?? '');
const activeItems = computed(() => categories.value.find(category => category.id === activeCategoryId.value)?.items ?? []);

type ViewMode = 'open' | 'grouped';
const viewModeStorageKey = 'kik-pos-view-mode';
const viewMode = ref<ViewMode>('open');

// Regelmäßiger Hintergrund-Sync der Nummernpools, damit Bon-Nummern und
// Stückzähler auch dann aktuell bleiben, wenn eine andere Kasse zwischenzeitlich verkauft hat
const POOL_SYNC_INTERVAL_MS = 20000;
let poolSyncTimer: ReturnType<typeof setInterval> | undefined;

async function syncPools() {
    try {
        const response = await $fetch<{ categories: StoreCategoryRecord[] }>('/api/store/catalog');
        for (const category of response.categories) {
            for (const item of category.items) {
                const fresh = item.numberPool;
                if (!fresh) continue;
                const pool = poolInstances.get(fresh.id);
                if (!pool || pool.updatedAt === fresh.updatedAt) continue;

                // Modal für genau diesen Pool ist offen und die Eingabe basiert
                // auf einem inzwischen veralteten Stand -> sichtbar machen statt still zu überschreiben
                if (numberPool.value?.id === pool.id && numberBaseline.value !== fresh.updatedAt) {
                    numberConflict.value = { nextNumber: fresh.nextNumber, updatedAt: fresh.updatedAt };
                }
                pool.nextNumber = fresh.nextNumber;
                pool.updatedAt = fresh.updatedAt;
            }
        }
    }
    catch {
        // Hintergrund-Sync ist nicht kritisch für den Kassenbetrieb; nächster Versuch folgt automatisch
    }
}

onMounted(() => {
    const stored = localStorage.getItem(viewModeStorageKey);
    if (stored === 'open' || stored === 'grouped') viewMode.value = stored;
    poolSyncTimer = setInterval(syncPools, POOL_SYNC_INTERVAL_MS);
});

onBeforeUnmount(() => {
    if (poolSyncTimer) clearInterval(poolSyncTimer);
});

function setViewMode(mode: ViewMode) {
    viewMode.value = mode;
    localStorage.setItem(viewModeStorageKey, mode);
}

function categoryStyle(category: StoreCategoryRecord) {
    if (!category.color) return undefined;
    return { backgroundColor: category.color, color: contrastTextColor(category.color) };
}

function itemStyle(item: StoreItemRecord) {
    if (!item.color) return undefined;
    return { backgroundColor: item.color, color: contrastTextColor(item.color) };
}

const cart = ref<CartLine[]>([]);
const paymentMethods: PaymentMethod[] = [PaymentMethod.Cash, PaymentMethod.Card];
const paymentMethod = ref<PaymentMethod>(PaymentMethod.Cash);
const checkoutPending = ref(false);
const errorMessage = ref('');
const lastBon = ref<BonRecord | null>(null);

const totalCents = computed(() => cart.value.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0));

const recentBons = ref<BonRecord[]>([]);

const priceItem = ref<StoreItemRecord | null>(null);
const priceInput = ref('');
const priceError = ref('');
const priceInputRef = ref<HTMLInputElement | null>(null);

const stornoTarget = ref<BonRecord | null>(null);
const stornoReason = ref('');
const stornoError = ref('');
const stornoPending = ref(false);

const numberPool = ref<NumberPoolRecord | null>(null);
const numberInput = ref('');
const numberError = ref('');
const numberPending = ref(false);
// Merkt sich den Artikel, der nach dem Setzen der Startnummer in den Bon soll
const numberAddItem = ref<StoreItemRecord | null>(null);
const numberInputRef = ref<HTMLInputElement | null>(null);
// Stand des Pools, auf dem die Eingabe im Modal basiert (Optimistic-Concurrency-Prüfung beim Speichern)
const numberBaseline = ref('');
// Wird gesetzt, wenn der Hintergrund-Sync erkennt, dass eine andere Kasse den offenen Pool geändert hat
const numberConflict = ref<{ nextNumber: number | null; updatedAt: string } | null>(null);

const itemsById = computed(() => {
    const map = new Map<string, StoreItemRecord>();
    for (const category of categories.value) {
        for (const item of category.items) map.set(item.id, item);
    }
    return map;
});

loadRecentBons();

function apiErrorMessage(error: unknown, fallback: string) {
    return (error as ApiError).data?.statusMessage ?? fallback;
}

async function loadRecentBons() {
    try {
        const response = await $fetch<{ bons: BonRecord[] }>('/api/store/bons');
        recentBons.value = response.bons.slice(0, 20);
    }
    catch {
        // Liste ist nicht kritisch für den Kassenbetrieb
    }
}

function addItem(item: StoreItemRecord) {
    errorMessage.value = '';
    if (item.numberPool && item.numberPool.nextNumber === null) {
        numberAddItem.value = item;
        openNumberModal(item.numberPool);
        return;
    }
    if (item.freePrice) {
        priceItem.value = item;
        priceInput.value = '';
        priceError.value = '';
        nextTick(() => priceInputRef.value?.focus());
        return;
    }

    const existing = cart.value.find(line => line.itemId === item.id && !line.freePrice);
    if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, 99);
        return;
    }
    cart.value.push({
        key: item.id,
        itemId: item.id,
        name: item.name,
        unitPriceCents: item.priceCents,
        freePrice: false,
        quantity: 1,
    });
}

function confirmPrice() {
    if (!priceItem.value) return;
    const cents = parseEuroInput(priceInput.value);
    if (cents === null || cents <= 0) {
        priceError.value = 'Bitte gib einen gültigen Betrag ein, z. B. 2,50.';
        return;
    }
    cart.value.push({
        key: `${priceItem.value.id}:${Date.now()}`,
        itemId: priceItem.value.id,
        name: priceItem.value.name,
        unitPriceCents: cents,
        freePrice: true,
        quantity: 1,
    });
    priceItem.value = null;
}

function nextNumberLabel(pool: NumberPoolRecord) {
    return pool.nextNumber === null ? 'Startnummer fehlt' : `Nächste Nr. ${pool.nextNumber}`;
}

function openNumberModal(pool: NumberPoolRecord) {
    numberPool.value = pool;
    numberInput.value = pool.nextNumber === null ? '' : String(pool.nextNumber);
    numberBaseline.value = pool.updatedAt;
    numberConflict.value = null;
    numberError.value = '';
    nextTick(() => numberInputRef.value?.focus());
}

function closeNumberModal() {
    if (numberPending.value) return;
    numberPool.value = null;
    numberAddItem.value = null;
    numberConflict.value = null;
}

// Übernimmt den von einer anderen Kasse gesetzten Stand in die Eingabe,
// statt ihn beim Speichern versehentlich zu überschreiben
function acceptFreshNumber() {
    if (!numberConflict.value) return;
    numberInput.value = numberConflict.value.nextNumber === null ? '' : String(numberConflict.value.nextNumber);
    numberBaseline.value = numberConflict.value.updatedAt;
    numberConflict.value = null;
    numberError.value = '';
}

async function confirmNumber() {
    const pool = numberPool.value;
    if (!pool || numberPending.value) return;
    const parsed = Number(numberInput.value);
    if (numberInput.value === '' || !Number.isInteger(parsed) || parsed < 0) {
        numberError.value = 'Bitte gib eine gültige Nummer ein, z. B. 1001.';
        return;
    }

    numberPending.value = true;
    numberError.value = '';
    try {
        const response = await $fetch<{ pool: { nextNumber: number | null; updatedAt: string } }>(`/api/store/pools/${pool.id}/number`, {
            method: 'POST',
            body: { nextNumber: parsed, expectedUpdatedAt: numberBaseline.value },
        });
        pool.nextNumber = response.pool.nextNumber;
        pool.updatedAt = response.pool.updatedAt;
        numberPool.value = null;
        numberConflict.value = null;
        const pendingItem = numberAddItem.value;
        numberAddItem.value = null;
        if (pendingItem) addItem(pendingItem);
    }
    catch (error: unknown) {
        const conflictPool = (error as ApiError).data?.data?.pool;
        if ((error as ApiError).data?.statusCode === 409 && conflictPool) {
            pool.nextNumber = conflictPool.nextNumber;
            pool.updatedAt = conflictPool.updatedAt;
            numberConflict.value = conflictPool;
            numberError.value = 'Der Nummernstand wurde inzwischen von einer anderen Kasse geändert. Bitte prüfen und übernehmen.';
        }
        else {
            numberError.value = apiErrorMessage(error, 'Die Nummer konnte nicht gespeichert werden.');
        }
    }
    finally {
        numberPending.value = false;
    }
}

// Zeigt an, welche Nummern eine Bon-Zeile voraussichtlich bekommt –
// Zeilen aus demselben Pool weiter oben im Bon zählen mit
function cartLineNumbers(line: CartLine) {
    const pool = itemsById.value.get(line.itemId)?.numberPool;
    if (!pool || pool.nextNumber === null) return '';

    let offset = 0;
    for (const entry of cart.value) {
        if (entry.key === line.key) break;
        if (itemsById.value.get(entry.itemId)?.numberPool?.id === pool.id) offset += entry.quantity;
    }

    const first = pool.nextNumber + offset;
    const last = first + line.quantity - 1;
    return first === last ? `Nr. ${first}` : `Nr. ${first}–${last}`;
}

function bonLineLabel(line: BonRecord['items'][number]) {
    const base = `${line.quantity}× ${line.name}`;
    if (line.firstNumber === null || line.lastNumber === null) return base;
    return line.firstNumber === line.lastNumber
        ? `${base} (Nr. ${line.firstNumber})`
        : `${base} (Nr. ${line.firstNumber}–${line.lastNumber})`;
}

function changeQuantity(line: CartLine, delta: number) {
    line.quantity += delta;
    if (line.quantity <= 0) {
        cart.value = cart.value.filter(entry => entry.key !== line.key);
    }
    else if (line.quantity > 99) {
        line.quantity = 99;
    }
}

async function checkout() {
    checkoutPending.value = true;
    errorMessage.value = '';
    try {
        const response = await $fetch<{ bon: BonRecord; pools: Array<{ id: string; nextNumber: number | null; updatedAt: string }> }>('/api/store/bons', {
            method: 'POST',
            body: {
                paymentMethod: paymentMethod.value,
                items: cart.value.map(line => ({
                    itemId: line.itemId,
                    quantity: line.quantity,
                    ...line.freePrice ? { priceCents: line.unitPriceCents } : {},
                })),
            },
        });
        lastBon.value = response.bon;
        // Nummernstände (inkl. updatedAt) lokal nachziehen, damit Anzeige und
        // Optimistic-Concurrency-Prüfung ohne Neuladen konsistent bleiben
        for (const fresh of response.pools) {
            const pool = poolInstances.get(fresh.id);
            if (pool) {
                pool.nextNumber = fresh.nextNumber;
                pool.updatedAt = fresh.updatedAt;
            }
        }
        cart.value = [];
        paymentMethod.value = PaymentMethod.Cash;
        await loadRecentBons();
    }
    catch (error: unknown) {
        errorMessage.value = apiErrorMessage(error, 'Der Bon konnte nicht gespeichert werden.');
    }
    finally {
        checkoutPending.value = false;
    }
}

function closeStorno() {
    stornoTarget.value = null;
    stornoReason.value = '';
    stornoError.value = '';
}

async function confirmStorno() {
    if (!stornoTarget.value) return;
    if (stornoReason.value.length < 3) {
        stornoError.value = 'Bitte gib einen Stornogrund an (mindestens 3 Zeichen).';
        return;
    }
    stornoPending.value = true;
    stornoError.value = '';
    try {
        await $fetch(`/api/store/bons/${stornoTarget.value.number}/storno`, {
            method: 'POST',
            body: { reason: stornoReason.value },
        });
        closeStorno();
        await loadRecentBons();
    }
    catch (error: unknown) {
        stornoError.value = apiErrorMessage(error, 'Der Bon konnte nicht storniert werden.');
    }
    finally {
        stornoPending.value = false;
    }
}

function formatTime(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.pos-page {
    min-height: 100dvh;
    color: $lightgray150;
    background: $darkgray1000;
}

.pos-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    gap: 1.25rem;

    width: min(1240px, 100%);
    margin: 0 auto;
    padding: 1.25rem;
}

.pos-empty {
    margin: 0.75rem 0;
    color: $lightgray400;
}

.pos-mode {
    display: inline-flex;
    gap: 0.25rem;

    margin-bottom: 1rem;
    padding: 0.25rem;
    border: 1px solid $darkgray800;
    border-radius: 999px;

    background: $darkgray950;

    &_button {
        min-height: 36px;
        font-size: 0.8rem;
        color: $lightgray300;

        svg {
            width: 1rem;
            height: 1rem;
        }
    }
}

.pos-open-category {
    margin-bottom: 1rem;
    padding: 0.85rem;
    border: 1px solid $darkgray800;
    border-radius: 12px;

    background: $darkgray900;

    &--colored {
        border-color: transparent;
    }

    &_head {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.6rem;

        svg {
            width: 1.25rem;
            height: 1.25rem;
        }

        h3 {
            margin: 0;
            font-size: 0.95rem;
            color: inherit;
        }
    }
}

.pos-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1rem;

    &_button {
        min-height: 40px;
        font-size: 0.85rem;

        svg {
            width: 1.05rem;
            height: 1.05rem;
        }
    }
}

.pos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.6rem;
}

.pos-item-wrap {
    position: relative;
    display: flex;
}

.pos-item {
    cursor: pointer;

    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;

    min-height: 76px;
    padding: 0.7rem 0.85rem;
    border: 1px solid $darkgray800;
    border-radius: 10px;

    font: inherit;
    text-align: left;

    background: $darkgray900;

    strong {
        color: $lightgray50;
        overflow-wrap: anywhere;
    }

    span {
        font-size: 0.8rem;
        color: $secondary300;
    }

    &:hover {
        border-color: $secondary600;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }

    &--colored {
        border-color: transparent;

        strong,
        span {
            color: inherit;
        }

        span {
            opacity: 0.75;
        }

        &:hover {
            border-color: transparent;
            filter: brightness(1.08);
        }
    }

    &_number {
        font-size: 0.72rem !important;
        font-weight: 700;
    }

    &_numedit {
        cursor: pointer;

        position: absolute;
        top: 0.35rem;
        right: 0.35rem;

        display: grid;
        place-items: center;

        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid rgb(255 255 255 / 20%);
        border-radius: 6px;

        color: inherit;

        background: rgb(0 0 0 / 25%);

        svg {
            width: 0.9rem;
            height: 0.9rem;
        }

        &:hover {
            border-color: $secondary600;
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

.pos-recent {
    margin-top: 1.75rem;

    h2 {
        margin: 0 0 0.6rem;
        font-size: 1.05rem;
        color: $lightgray0;
    }

    &_list {
        display: grid;
        gap: 0.45rem;

        margin: 0;
        padding: 0;

        list-style: none;
    }

    &_row {
        display: flex;
        gap: 0.6rem;
        align-items: center;
        justify-content: space-between;

        padding: 0.6rem 0.8rem;
        border: 1px solid $darkgray800;
        border-radius: 9px;

        background: $darkgray900;

        &--cancelled {
            opacity: 0.65;
        }
    }

    &_main {
        display: grid;
        gap: 0.15rem;
        min-width: 0;

        strong {
            color: $lightgray50;
        }

        span {
            font-size: 0.78rem;
            color: $lightgray300;
        }
    }

    &_items {
        overflow-wrap: anywhere;
    }

    &_storno {
        color: $error300 !important;
    }

    &_cancel {
        cursor: pointer;

        flex-shrink: 0;

        min-height: 36px;
        padding: 0 0.8rem;
        border: 1px solid $error500;
        border-radius: 8px;

        font: inherit;
        font-size: 0.78rem;
        color: $error300;

        background: transparent;

        &:hover {
            background: rgb(194 37 105 / 8%);
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

.pos-cart {
    position: sticky;
    top: 1rem;

    align-self: flex-start;

    padding: 1rem;
    border: 1px solid $darkgray800;
    border-radius: 12px;

    background: $darkgray950;

    h2 {
        margin: 0 0 0.75rem;
        font-size: 1.05rem;
        color: $lightgray0;
    }

    &_last {
        margin: 0 0 0.75rem;
        padding: 0.6rem 0.75rem;
        border: 1px solid $success400;
        border-radius: 8px;

        font-size: 0.82rem;
        color: $success400;

        background: rgb(74 222 128 / 6%);
    }

    &_error {
        margin: 0 0 0.75rem;
        padding: 0.6rem 0.75rem;
        border: 1px solid $error500;
        border-radius: 8px;

        font-size: 0.82rem;
        color: $error300;

        background: rgb(194 37 105 / 8%);
    }

    &_list {
        display: grid;
        gap: 0.5rem;

        margin: 0 0 0.75rem;
        padding: 0;

        list-style: none;
    }

    &_line {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 0.5rem;
        align-items: center;
    }

    &_line-info {
        display: grid;
        min-width: 0;

        strong {
            font-size: 0.85rem;
            color: $lightgray50;
            overflow-wrap: anywhere;
        }

        span {
            font-size: 0.72rem;
            color: $lightgray400;
        }
    }

    &_line-controls {
        display: inline-flex;
        gap: 0.35rem;
        align-items: center;

        :deep(.button) {
            width: 32px;
            height: 32px;
            border: 1px solid $darkgray700;
            border-radius: 6px;

            color: $lightgray100;

            background: transparent;

            &:focus-visible {
                outline: 2px solid $primary400;
            }
        }

        span {
            min-width: 1.4rem;
            font-size: 0.9rem;
            text-align: center;
        }
    }

    &_line-total {
        font-size: 0.85rem;
        color: $secondary300;
        text-align: right;
    }

    &_total {
        display: flex;
        align-items: baseline;
        justify-content: space-between;

        margin: 0.75rem 0;
        padding-top: 0.75rem;
        border-top: 1px solid $darkgray800;

        span {
            font-size: 0.8rem;
            color: $lightgray300;
        }

        strong {
            font-size: 1.5rem;
            color: $lightgray0;
        }
    }

    &_payment {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
    }

    &_payment-button {
        min-height: 42px;
        font-size: 0.85rem;

        svg {
            width: 1.1rem;
            height: 1.1rem;
        }
    }

    &_checkout {
        cursor: pointer;

        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;

        width: 100%;
        min-height: 52px;
        border: 0;
        border-radius: 8px;

        font: inherit;
        font-size: 1.05rem;
        font-weight: 700;
        color: $whiteOrig;

        background: $primary500;

        &:disabled {
            cursor: default;
            opacity: 0.5;
        }

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 3px;
        }
    }

    &_clear {
        cursor: pointer;

        width: 100%;
        margin-top: 0.5rem;
        padding: 0.4rem;
        border: 0;

        font: inherit;
        font-size: 0.78rem;
        color: $lightgray400;
        text-decoration: underline;

        background: transparent;

        &:focus-visible {
            outline: 2px solid $primary400;
        }
    }
}

.pos-modal {
    position: fixed;
    z-index: 300;
    inset: 0;

    display: grid;
    place-items: center;

    padding: 1rem;

    background: rgb(0 0 0 / 55%);

    &_box {
        width: min(420px, 100%);
        padding: 1.25rem;
        border: 1px solid $darkgray700;
        border-radius: 12px;

        background: $darkgray900;

        h3 {
            margin: 0 0 0.75rem;
            color: $lightgray0;
        }
    }

    &_hint {
        margin: 0 0 0.75rem;
        font-size: 0.82rem;
        color: $lightgray300;
    }

    &_field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        span {
            font-size: 0.72rem;
            font-weight: 700;
            color: $lightgray200;
        }

        input {
            min-height: 44px;
            padding: 0 0.75rem;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            font: inherit;
            color: $lightgray50;

            background: $darkgray950;
            outline: none;

            &:focus-visible {
                border-color: $primary400;
                outline: 2px solid rgb(221 91 69 / 22%);
            }
        }
    }

    &_error {
        margin: 0.75rem 0 0;
        font-size: 0.8rem;
        color: $error300;
    }

    &_conflict {
        margin: 0.75rem 0 0;
        padding: 0.6rem 0.75rem;
        border: 1px solid $warning400;
        border-radius: 8px;

        font-size: 0.8rem;
        line-height: 1.5;
        color: $warning300;

        background: rgb(226 148 31 / 10%);

        &-action {
            cursor: pointer;

            display: block;

            margin-top: 0.35rem;
            padding: 0;
            border: 0;

            font: inherit;
            font-weight: 700;
            color: $warning300;
            text-decoration: underline;

            background: none;

            &:focus-visible {
                outline: 2px solid $warning300;
                outline-offset: 2px;
            }
        }
    }

    &_actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    &_primary,
    &_secondary,
    &_danger {
        cursor: pointer;

        min-height: 42px;
        padding: 0 1rem;
        border: 0;
        border-radius: 8px;

        font: inherit;
        font-weight: 700;

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 2px;
        }
    }

    &_primary {
        color: $whiteOrig;
        background: $primary500;
    }

    &_secondary {
        border: 1px solid $darkgray700;
        color: $lightgray200;
        background: transparent;
    }

    &_danger {
        color: $whiteOrig;
        background: $error500;

        &:disabled {
            cursor: wait;
            opacity: 0.55;
        }
    }
}

@include mobileOnly {
    .pos-layout {
        grid-template-columns: 1fr;
        padding: 0.9rem;
    }

    .pos-cart {
        position: static;
    }
}
</style>
