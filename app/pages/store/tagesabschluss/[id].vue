<template>
    <main class="abschluss-detail">
        <store-header :title="`Tagesabschluss #${abschluss.number}`" />

        <div class="abschluss-detail_layout">
            <header class="abschluss-detail_head">
                <div>
                    <p>{{ formatDateTime(abschluss.periodStart) }} – {{ formatDateTime(abschluss.periodEnd) }}</p>
                    <span>Erstellt von {{ abschluss.createdByName }} am {{ formatDateTime(abschluss.createdAt) }}</span>
                </div>
                <div class="abschluss-detail_exports">
                    <button
                        v-if="can(Permission.KasseReportsEdit)"
                        type="button"
                        class="abschluss-detail_export"
                        @click="toggleEdit"
                    >
                        <Icon name="material-symbols:edit-rounded" aria-hidden="true" /> Bearbeiten
                    </button>
                    <a :href="`/api/store/tagesabschluss/${abschluss.number}/export?format=pdf`" class="abschluss-detail_export">
                        <Icon name="material-symbols:picture-as-pdf-rounded" aria-hidden="true" /> PDF
                    </a>
                    <a :href="`/api/store/tagesabschluss/${abschluss.number}/export?format=xlsx`" class="abschluss-detail_export">
                        <Icon name="material-symbols:table-chart-outline" aria-hidden="true" /> XLSX
                    </a>
                    <a :href="`/api/store/tagesabschluss/${abschluss.number}/export?format=csv`" class="abschluss-detail_export">
                        <Icon name="material-symbols:csv-outline" aria-hidden="true" /> CSV
                    </a>
                </div>
            </header>

            <section v-if="editing" class="abschluss-detail_edit" aria-label="Tagesabschluss bearbeiten">
                <h2>Tagesabschluss bearbeiten</h2>
                <p class="abschluss-detail_edit-hint">
                    Umsätze und Artikel werden aus den Bons abgeleitet. Hier lassen sich die Kassenbestände anpassen;
                    jede Änderung wird protokolliert.
                </p>
                <form class="abschluss-detail_edit-form" @submit.prevent="saveEdit">
                    <label>
                        <span>Kassenbestand Beginn (EUR)</span>
                        <input v-model.trim="editOpeningCash" required inputmode="decimal" placeholder="z. B. 100,00">
                    </label>
                    <label>
                        <span>Gezählter Kassenbestand (EUR)</span>
                        <input v-model.trim="editCountedCash" required inputmode="decimal" placeholder="z. B. 245,50">
                    </label>
                    <p v-if="editError" class="abschluss-detail_edit-error" role="alert">{{ editError }}</p>
                    <div class="abschluss-detail_edit-actions">
                        <button type="button" class="abschluss-detail_edit-cancel" @click="editing = false">Abbrechen</button>
                        <button type="submit" class="abschluss-detail_edit-save" :disabled="editPending">
                            {{ editPending ? 'Wird gespeichert …' : 'Speichern' }}
                        </button>
                    </div>
                </form>
            </section>

            <dl class="abschluss-detail_stats">
                <div><dt>Umsatz gesamt</dt><dd>{{ formatCents(abschluss.revenueCents) }}</dd></div>
                <div><dt>Umsatz Bar</dt><dd>{{ formatCents(abschluss.cashRevenueCents) }}</dd></div>
                <div><dt>Umsatz Karte</dt><dd>{{ formatCents(abschluss.cardRevenueCents) }}</dd></div>
                <div><dt>Bons</dt><dd>{{ abschluss.bonCount }}</dd></div>
                <div><dt>Storno</dt><dd>{{ abschluss.stornoCount }} ({{ formatCents(abschluss.stornoTotalCents) }})</dd></div>
                <div><dt>Kasse Beginn</dt><dd>{{ formatCents(abschluss.openingCashCents) }}</dd></div>
                <div><dt>Kasse erwartet</dt><dd>{{ formatCents(abschluss.expectedCashCents) }}</dd></div>
                <div><dt>Kasse gezählt</dt><dd>{{ formatCents(abschluss.countedCashCents) }}</dd></div>
                <div>
                    <dt>Differenz</dt>
                    <dd :class="{ 'abschluss-detail_diff': abschluss.differenceCents !== 0 }">{{ formatCents(abschluss.differenceCents) }}</dd>
                </div>
            </dl>

            <section class="abschluss-detail_section" aria-label="Verkaufte Artikel">
                <h2>Verkaufte Artikel</h2>
                <p v-if="!abschluss.breakdown.length" class="abschluss-detail_empty">Keine Verkäufe in diesem Zeitraum.</p>
                <div v-for="category in abschluss.breakdown" :key="category.categoryName" class="abschluss-detail_category">
                    <h3>{{ category.categoryName }} · {{ formatCents(category.totalCents) }}</h3>
                    <div class="abschluss-detail_table-wrap">
                        <table>
                            <thead>
                                <tr><th>Artikel</th><th>Einzelpreis</th><th>Menge</th><th>Summe</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in category.items" :key="`${item.name}-${item.unitPriceCents}`">
                                    <td>{{ item.name }}</td>
                                    <td>{{ formatCents(item.unitPriceCents) }}</td>
                                    <td>{{ item.quantity }}</td>
                                    <td>{{ formatCents(item.totalCents) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section class="abschluss-detail_section" aria-label="Bons">
                <header class="abschluss-detail_section-head">
                    <h2>Bons</h2>
                    <button
                        v-if="can(Permission.KasseReportsEdit)"
                        type="button"
                        class="abschluss-detail_add-bon"
                        :disabled="bonPending || !catalogItemCount"
                        @click="startCreateBon"
                    >
                        <Icon name="material-symbols:add-rounded" aria-hidden="true" /> Neuer Bon
                    </button>
                </header>
                <store-report-bon-editor
                    v-if="bonEditor !== null"
                    :key="String(bonEditor)"
                    :categories="catalogCategories"
                    :bon="editingBon"
                    :default-created-at="abschluss.periodEnd"
                    :min-created-at="abschluss.periodStart"
                    :max-created-at="abschluss.periodEnd"
                    :pending="bonPending"
                    :error="bonError"
                    :submit-label="bonEditor === 'create' ? 'Bon anlegen' : 'Bon speichern'"
                    class="abschluss-detail_bon-editor"
                    @submit="saveBon"
                    @cancel="closeBonEditor"
                />
                <p v-if="bonActionError" class="abschluss-detail_bon-error" role="alert">{{ bonActionError }}</p>
                <p v-if="!abschluss.bons.length" class="abschluss-detail_empty">Keine Bons in diesem Zeitraum.</p>
                <div v-else class="abschluss-detail_table-wrap">
                    <table>
                        <thead>
                            <tr><th>Nr.</th><th>Zeitpunkt</th><th>Zahlungsart</th><th>Status</th><th>Positionen</th><th>Betrag</th><th>Erstellt von</th><th>Storno</th><th v-if="can(Permission.KasseReportsEdit)">Aktionen</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="bon in abschluss.bons" :key="bon.number" :class="{ 'abschluss-detail_cancelled': bon.status === 'CANCELLED' }">
                                <td>#{{ bon.number }}</td>
                                <td>{{ formatDateTime(bon.createdAt) }}</td>
                                <td>{{ paymentMethodLabels[bon.paymentMethod] }}</td>
                                <td>{{ bon.status === 'CANCELLED' ? 'Storniert' : 'Abgeschlossen' }}</td>
                                <td class="abschluss-detail_bon-lines">
                                    <span v-for="line in bon.items" :key="line.id">{{ line.quantity }}× {{ line.name }}</span>
                                </td>
                                <td>{{ formatCents(bon.totalCents) }}</td>
                                <td>{{ bon.createdByName }}</td>
                                <td>
                                    <template v-if="bon.status === 'CANCELLED'">
                                        {{ bon.cancelledByName }}{{ bon.cancelReason ? `: ${bon.cancelReason}` : '' }}
                                    </template>
                                </td>
                                <td v-if="can(Permission.KasseReportsEdit)" class="abschluss-detail_bon-actions">
                                    <button type="button" aria-label="Bon bearbeiten" :disabled="bonPending" @click="startEditBon(bon)">
                                        <Icon name="material-symbols:edit-rounded" aria-hidden="true" />
                                    </button>
                                    <button type="button" class="abschluss-detail_bon-delete" aria-label="Bon löschen" :disabled="bonPending" @click="deleteBon(bon)">
                                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import type { BonRecord, StoreCategoryRecord, TagesabschlussRecord } from '~~/types/store';
import { paymentMethodLabels } from '~~/types/store';
import type { ReportBonPayload } from '~/components/store/StoreReportBonEditor.vue';
import { requireStorePermission } from '~/composables/storeAccess';
import { usePermissions } from '~/composables/permissions';
import { usePageSeo } from '~/composables/seo';
import { formatCents, parseEuroInput } from '~/utils/currency';

definePageMeta({ layout: 'empty' });

await requireStorePermission(Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage);

const { can } = usePermissions();

const route = useRoute();
const numberParam = Number(route.params.id);
if (!Number.isInteger(numberParam) || numberParam < 1) {
    throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden', fatal: true });
}

const requestFetch = useRequestFetch();
const response = await requestFetch<{ abschluss: TagesabschlussRecord }>(`/api/store/tagesabschluss/${numberParam}`).catch(() => null);
if (!response) {
    throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden', fatal: true });
}

const abschluss = ref(response.abschluss);
const catalogResponse = can(Permission.KasseReportsEdit)
    ? await requestFetch<{ categories: StoreCategoryRecord[] }>('/api/store/catalog')
    : { categories: [] };
const catalogCategories = ref(catalogResponse.categories);

usePageSeo(() => ({ title: `Tagesabschluss #${abschluss.value.number}`, noindex: true }));

interface ApiError {
    data?: { statusMessage?: string };
}

const editing = ref(false);
const editPending = ref(false);
const editError = ref('');
const editOpeningCash = ref('');
const editCountedCash = ref('');
const bonEditor = ref<'create' | number | null>(null);
const bonPending = ref(false);
const bonError = ref('');
const bonActionError = ref('');

const catalogItemCount = computed(() => catalogCategories.value.reduce((sum, category) => sum + category.items.length, 0));
const editingBon = computed(() => typeof bonEditor.value === 'number'
    ? abschluss.value.bons.find(bon => bon.number === bonEditor.value)
    : undefined);

function euroString(cents: number) {
    return (cents / 100).toFixed(2).replace('.', ',');
}

function toggleEdit() {
    editing.value = !editing.value;
    if (editing.value) {
        editOpeningCash.value = euroString(abschluss.value.openingCashCents);
        editCountedCash.value = euroString(abschluss.value.countedCashCents);
        editError.value = '';
    }
}

async function saveEdit() {
    const opening = parseEuroInput(editOpeningCash.value);
    const counted = parseEuroInput(editCountedCash.value);
    if (opening === null || counted === null) {
        editError.value = 'Bitte gib gültige Beträge ein, z. B. 25,00.';
        return;
    }

    editPending.value = true;
    editError.value = '';
    try {
        const result = await $fetch<{ abschluss: TagesabschlussRecord }>(`/api/store/tagesabschluss/${abschluss.value.number}`, {
            method: 'PUT',
            body: { openingCashCents: opening, countedCashCents: counted },
        });
        abschluss.value = result.abschluss;
        editing.value = false;
    }
    catch (error: unknown) {
        editError.value = (error as ApiError).data?.statusMessage ?? 'Die Änderungen konnten nicht gespeichert werden.';
    }
    finally {
        editPending.value = false;
    }
}

function startCreateBon() {
    bonEditor.value = 'create';
    bonError.value = '';
    bonActionError.value = '';
}

function startEditBon(bon: BonRecord) {
    bonEditor.value = bon.number;
    bonError.value = '';
    bonActionError.value = '';
}

function closeBonEditor() {
    if (bonPending.value) return;
    bonEditor.value = null;
    bonError.value = '';
}

async function saveBon(payload: ReportBonPayload) {
    if (bonPending.value || bonEditor.value === null) return;
    bonPending.value = true;
    bonError.value = '';
    const path = bonEditor.value === 'create'
        ? `/api/store/tagesabschluss/${abschluss.value.number}/bons`
        : `/api/store/tagesabschluss/${abschluss.value.number}/bons/${bonEditor.value}`;
    try {
        const result = await $fetch<{ abschluss: TagesabschlussRecord }>(path, {
            method: bonEditor.value === 'create' ? 'POST' : 'PUT',
            body: payload,
        });
        abschluss.value = result.abschluss;
        bonEditor.value = null;
    }
    catch (error: unknown) {
        bonError.value = (error as ApiError).data?.statusMessage ?? 'Der Bon konnte nicht gespeichert werden.';
    }
    finally {
        bonPending.value = false;
    }
}

async function deleteBon(bon: BonRecord) {
    if (bonPending.value || !confirm(`Bon #${bon.number} endgültig löschen?`)) return;
    bonPending.value = true;
    bonActionError.value = '';
    try {
        const result = await $fetch<{ abschluss: TagesabschlussRecord }>(`/api/store/tagesabschluss/${abschluss.value.number}/bons/${bon.number}`, {
            method: 'DELETE',
        });
        abschluss.value = result.abschluss;
        if (bonEditor.value === bon.number) bonEditor.value = null;
    }
    catch (error: unknown) {
        bonActionError.value = (error as ApiError).data?.statusMessage ?? 'Der Bon konnte nicht gelöscht werden.';
    }
    finally {
        bonPending.value = false;
    }
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.abschluss-detail {
    min-height: 100dvh;
    color: $lightgray150;
    background: $darkgray1000;

    &_layout {
        width: min(980px, 100%);
        margin: 0 auto;
        padding: 1.25rem;
    }

    &_head {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 1rem;

        p {
            margin: 0;
            font-size: 1rem;
            color: $lightgray0;
        }

        span {
            font-size: 0.78rem;
            color: $lightgray400;
        }
    }

    &_exports {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    &_export {
        display: inline-flex;
        gap: 0.35rem;
        align-items: center;

        min-height: 38px;
        padding: 0 0.8rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font-size: 0.8rem;
        color: $lightgray200;
        text-decoration: none;

        svg {
            width: 1.05rem;
            height: 1.05rem;
        }

        &:hover {
            border-color: $secondary600;
            color: $secondary300;
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }

    &_edit {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid $secondary600;
        border-radius: 12px;

        background: $darkgray950;

        h2 {
            margin: 0 0 0.35rem;
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }

    &_edit-hint {
        margin: 0 0 0.85rem;
        font-size: 0.8rem;
        color: $lightgray300;
    }

    &_edit-form {
        display: grid;
        gap: 0.75rem;
        max-width: 26rem;

        label {
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

                background: $darkgray900;
                outline: none;

                &:focus-visible {
                    border-color: $primary400;
                    outline: 2px solid rgb(221 91 69 / 22%);
                }
            }
        }
    }

    &_edit-error {
        margin: 0;
        font-size: 0.8rem;
        color: $error300;
    }

    &_edit-actions {
        display: flex;
        gap: 0.5rem;
    }

    &_edit-save,
    &_edit-cancel {
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

    &_edit-save {
        color: $whiteOrig;
        background: $primary500;

        &:disabled {
            cursor: wait;
            opacity: 0.55;
        }
    }

    &_edit-cancel {
        border: 1px solid $darkgray700;
        color: $lightgray200;
        background: transparent;
    }

    &_stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.5rem;
        margin: 0 0 1.5rem;

        > div {
            padding: 0.6rem 0.75rem;
            border: 1px solid $darkgray800;
            border-radius: 8px;
            background: $darkgray950;
        }

        dt {
            font-size: 0.7rem;
            color: $lightgray400;
        }

        dd {
            margin: 0.15rem 0 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: $lightgray0;
        }
    }

    &_diff {
        color: $error300 !important;
    }

    &_section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid $darkgray800;
        border-radius: 12px;

        background: $darkgray950;

        h2 {
            margin: 0 0 0.75rem;
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }

    &_section-head {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 0.75rem;

        h2 {
            margin: 0;
        }
    }

    &_add-bon {
        cursor: pointer;

        display: inline-flex;
        gap: 0.35rem;
        align-items: center;

        min-height: 38px;
        padding: 0 0.75rem;
        border: 0;
        border-radius: 8px;

        font: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        color: $whiteOrig;

        background: $primary500;

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 2px;
        }
    }

    &_bon-editor {
        margin-bottom: 1rem;
    }

    &_bon-error {
        margin: 0 0 0.75rem;
        font-size: 0.8rem;
        color: $error300;
    }

    &_empty {
        margin: 0;
        color: $lightgray400;
    }

    &_category {
        margin-bottom: 1rem;

        h3 {
            margin: 0 0 0.5rem;
            font-size: 0.9rem;
            color: $secondary300;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    &_table-wrap {
        overflow-x: auto;

        table {
            border-collapse: collapse;
            width: 100%;
            font-size: 0.82rem;
        }

        th,
        td {
            padding: 0.45rem 0.6rem;
            text-align: left;
            white-space: nowrap;
        }

        th {
            border-bottom: 1px solid $darkgray800;

            font-size: 0.68rem;
            font-weight: 700;
            color: $lightgray400;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        tbody tr {
            border-bottom: 1px solid $darkgray850;

            &:last-child {
                border-bottom: 0;
            }
        }

        td:last-child {
            white-space: normal;
        }
    }

    &_cancelled {
        opacity: 0.6;
    }

    &_bon-lines {
        display: grid;
        gap: 0.15rem;
        min-width: 10rem;

        span {
            white-space: normal;
        }
    }

    &_bon-actions {
        display: flex;
        gap: 0.35rem;

        button {
            cursor: pointer;

            display: grid;
            place-items: center;

            width: 34px;
            height: 34px;
            padding: 0;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            color: $lightgray200;

            background: transparent;

            &:disabled {
                cursor: wait;
                opacity: 0.5;
            }

            &:focus-visible {
                outline: 2px solid $primary400;
                outline-offset: 2px;
            }
        }

        .abschluss-detail_bon-delete {
            color: $error300;
        }
    }
}

@include mobileOnly {
    .abschluss-detail_layout {
        padding: 0.9rem;
    }
}
</style>
