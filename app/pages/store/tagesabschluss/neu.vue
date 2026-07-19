<template>
    <main class="abschlussneu-page">
        <store-header title="Tagesabschluss" />

        <div class="abschlussneu-layout">
            <p v-if="errorMessage" class="abschlussneu-error" role="alert">{{ errorMessage }}</p>

            <section class="abschlussneu-section" aria-label="Offene Periode">
                <h2>Offene Periode</h2>
                <p class="abschlussneu-period">
                    Offene Periode{{ preview.periodStart ? ` seit ${formatDateTime(preview.periodStart)}` : '' }}
                </p>
                <dl class="abschlussneu-stats">
                    <div><dt>Bons</dt><dd>{{ preview.stats.bonCount }}</dd></div>
                    <div><dt>Umsatz</dt><dd>{{ formatCents(preview.stats.revenueCents) }}</dd></div>
                    <div><dt>davon Bar</dt><dd>{{ formatCents(preview.stats.cashRevenueCents) }}</dd></div>
                    <div><dt>davon Karte</dt><dd>{{ formatCents(preview.stats.cardRevenueCents) }}</dd></div>
                    <div><dt>Storno</dt><dd>{{ preview.stats.stornoCount }} ({{ formatCents(preview.stats.stornoTotalCents) }})</dd></div>
                </dl>
            </section>

            <form class="abschlussneu-form" @submit.prevent="createAbschluss">
                <section class="abschlussneu-section" aria-label="Kasse zählen">
                    <h2>Kasse zählen</h2>
                    <div class="abschlussneu-fields">
                        <label>
                            <span>Kassenbestand zu Beginn (EUR)</span>
                            <input v-model.trim="openingCashInput" required inputmode="decimal" placeholder="z. B. 100,00">
                        </label>
                        <label>
                            <span>Gezählter Kassenbestand jetzt (EUR)</span>
                            <input v-model.trim="countedCashInput" required inputmode="decimal" placeholder="z. B. 245,50">
                        </label>
                    </div>
                    <p v-if="expectedCashCents !== null" class="abschlussneu-expected">
                        Erwartet: {{ formatCents(expectedCashCents) }}
                        <template v-if="differenceCents !== null">
                            · Differenz: <strong :class="{ 'abschlussneu-expected_diff--bad': differenceCents !== 0 }">{{ formatCents(differenceCents) }}</strong>
                        </template>
                    </p>
                    <label v-if="needsCashReason" class="abschlussneu-reason">
                        <span>Die Kasse ist im Minus – Grund (Pflicht)</span>
                        <input v-model.trim="cashDifferenceReason" required minlength="3" maxlength="300" placeholder="z. B. Wechselgeld falsch herausgegeben">
                    </label>
                </section>

                <section v-if="preview.numberedPools.length" class="abschlussneu-section" aria-label="Kartennummern prüfen">
                    <h2>Kartennummern prüfen</h2>
                    <p class="abschlussneu-hint">
                        Trage für jeden Nummernpool die zuletzt verkaufte Nummer ein.
                        Weicht sie von der erwarteten Nummer ab, ist ein Grund erforderlich.
                    </p>
                    <div v-for="entry in numberedForms" :key="entry.stat.poolId" class="abschlussneu-numbered">
                        <div class="abschlussneu-numbered_info">
                            <strong>{{ entry.stat.name }}</strong>
                            <span>
                                Erste Nr. {{ entry.stat.firstNumber }} · Letzte Nr. (erwartet) {{ entry.stat.lastNumber }}
                                · Stückzahl {{ entry.stat.quantity }}
                            </span>
                        </div>
                        <label>
                            <span>Letzte verkaufte Nummer (gezählt)</span>
                            <input
                                v-model.trim="entry.countedInput"
                                required
                                inputmode="numeric"
                                :placeholder="`z. B. ${entry.stat.lastNumber}`"
                            >
                        </label>
                        <label v-if="numberedMismatch(entry)" class="abschlussneu-reason">
                            <span>Nummer weicht ab – Grund (Pflicht)</span>
                            <input v-model.trim="entry.reason" required minlength="3" maxlength="300" placeholder="z. B. Karte falsch abgerissen">
                        </label>
                    </div>
                </section>

                <button type="submit" class="abschlussneu-submit" :disabled="pending">
                    <Icon :name="pending ? 'material-symbols:progress-activity' : 'material-symbols:receipt-long-rounded'" aria-hidden="true" />
                    {{ pending ? 'Wird erstellt …' : 'Tagesabschluss durchführen' }}
                </button>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import type { NumberedPoolStat, TagesabschlussPreview } from '~~/types/store';
import { requireStorePermission } from '~/composables/storeAccess';
import { usePageSeo } from '~/composables/seo';
import { formatCents, parseEuroInput } from '~/utils/currency';

definePageMeta({ layout: 'empty' });
usePageSeo(() => ({ title: 'Tagesabschluss', noindex: true }));

await requireStorePermission(Permission.KasseManage);

interface ApiError {
    data?: { statusMessage?: string };
}

interface NumberedForm {
    stat: NumberedPoolStat;
    countedInput: string;
    reason: string;
}

const requestFetch = useRequestFetch();
const preview = await requestFetch<TagesabschlussPreview>('/api/store/tagesabschluss-preview');

const openingCashInput = ref((preview.suggestedOpeningCashCents / 100).toFixed(2).replace('.', ','));
const countedCashInput = ref('');
const cashDifferenceReason = ref('');
const pending = ref(false);
const errorMessage = ref('');

const numberedForms = ref<NumberedForm[]>(preview.numberedPools.map(stat => ({ stat, countedInput: '', reason: '' })));

const expectedCashCents = computed(() => {
    const opening = parseEuroInput(openingCashInput.value);
    if (opening === null) return null;
    return opening + preview.stats.cashRevenueCents;
});

const differenceCents = computed(() => {
    const counted = parseEuroInput(countedCashInput.value);
    if (counted === null || expectedCashCents.value === null) return null;
    return counted - expectedCashCents.value;
});

const needsCashReason = computed(() => differenceCents.value !== null && differenceCents.value < 0);

function parseCounted(entry: NumberedForm) {
    if (entry.countedInput === '') return null;
    const parsed = Number(entry.countedInput);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function numberedMismatch(entry: NumberedForm) {
    const counted = parseCounted(entry);
    return counted !== null && counted !== entry.stat.lastNumber;
}

async function createAbschluss() {
    if (pending.value) return;
    const opening = parseEuroInput(openingCashInput.value);
    const counted = parseEuroInput(countedCashInput.value);
    if (opening === null || counted === null) {
        errorMessage.value = 'Bitte gib gültige Beträge ein, z. B. 100,00.';
        return;
    }

    if (needsCashReason.value && cashDifferenceReason.value.length < 3) {
        errorMessage.value = 'Die Kasse ist im Minus. Bitte gib einen Grund für die Differenz an.';
        return;
    }

    const numberedPools: Array<{ poolId: string; countedLastNumber: number; reason?: string }> = [];
    for (const entry of numberedForms.value) {
        const countedNumber = parseCounted(entry);
        if (countedNumber === null) {
            errorMessage.value = `Bitte gib für „${entry.stat.name}“ die letzte verkaufte Nummer an.`;
            return;
        }
        if (countedNumber !== entry.stat.lastNumber && entry.reason.length < 3) {
            errorMessage.value = `Die letzte Nummer für „${entry.stat.name}“ weicht ab. Bitte gib einen Grund an.`;
            return;
        }
        numberedPools.push({
            poolId: entry.stat.poolId,
            countedLastNumber: countedNumber,
            ...countedNumber !== entry.stat.lastNumber ? { reason: entry.reason } : {},
        });
    }

    pending.value = true;
    errorMessage.value = '';
    try {
        const response = await $fetch<{ abschluss: { number: number } }>('/api/store/tagesabschluss', {
            method: 'POST',
            body: {
                openingCashCents: opening,
                countedCashCents: counted,
                ...needsCashReason.value ? { cashDifferenceReason: cashDifferenceReason.value } : {},
                numberedPools,
            },
        });
        await navigateTo(`/store/tagesabschluss/${response.abschluss.number}`);
    }
    catch (error: unknown) {
        errorMessage.value = (error as ApiError).data?.statusMessage ?? 'Der Tagesabschluss konnte nicht erstellt werden.';
    }
    finally {
        pending.value = false;
    }
}

function formatDateTime(value: string) {
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
.abschlussneu-page {
    min-height: 100dvh;
    color: $lightgray150;
    background: $darkgray1000;
}

.abschlussneu-layout {
    width: min(720px, 100%);
    margin: 0 auto;
    padding: 1.25rem;
}

.abschlussneu-error {
    margin: 0 0 1rem;
    padding: 0.75rem;
    border: 1px solid $error500;
    border-radius: 8px;

    color: $error300;

    background: rgb(194 37 105 / 8%);
}

.abschlussneu-section {
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

.abschlussneu-period {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: $lightgray300;
}

.abschlussneu-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.5rem;
    margin: 0;

    > div {
        padding: 0.6rem 0.75rem;
        border: 1px solid $darkgray800;
        border-radius: 8px;
        background: $darkgray900;
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

.abschlussneu-form {
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

.abschlussneu-fields {
    display: grid;
    gap: 0.75rem;
    max-width: 26rem;
}

.abschlussneu-expected {
    margin: 0.75rem 0 0;
    font-size: 0.82rem;
    color: $lightgray300;

    strong {
        color: $success400;
    }

    &_diff--bad {
        color: $error300 !important;
    }
}

.abschlussneu-reason {
    max-width: 26rem;
    margin-top: 0.75rem;

    span {
        color: $error300 !important;
    }
}

.abschlussneu-hint {
    margin: 0 0 0.85rem;
    font-size: 0.8rem;
    color: $lightgray300;
}

.abschlussneu-numbered {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border: 1px solid $darkgray850;
    border-radius: 10px;

    background: $darkgray900;

    &:last-child {
        margin-bottom: 0;
    }

    &_info {
        display: grid;
        gap: 0.15rem;
        margin-bottom: 0.6rem;

        strong {
            font-size: 0.9rem;
            color: $lightgray50;
        }

        span {
            font-size: 0.78rem;
            color: $secondary300;
        }
    }

    label {
        max-width: 26rem;
    }
}

.abschlussneu-submit {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    min-height: 50px;
    padding: 0 1.25rem;
    border: 0;
    border-radius: 8px;

    font: inherit;
    font-size: 1rem;
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
    .abschlussneu-layout {
        padding: 0.9rem;
    }
}
</style>
