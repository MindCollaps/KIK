<template>
    <ui-form class="report-bon-editor" @submit.prevent="submit">
        <div class="report-bon-editor_meta">
            <label>
                <span>Zahlungsart</span>
                <ui-select v-model="paymentMethod">
                    <option :value="PaymentMethod.Cash">Bar</option>
                    <option :value="PaymentMethod.Card">Karte</option>
                </ui-select>
            </label>
            <label>
                <span>Zeitpunkt</span>
                <ui-input-date-time v-model="createdAt" :min="minDateTime" :max="maxDateTime" required />
            </label>
        </div>

        <div class="report-bon-editor_lines">
            <div v-for="(line, index) in lines" :key="line.key" class="report-bon-editor_line">
                <label class="report-bon-editor_item">
                    <span>Artikel</span>
                    <ui-select v-model="line.itemId" required @change="selectItem(line)">
                        <option value="" disabled>Artikel wählen</option>
                        <option v-if="historicalOption(line)" :value="historicalOption(line)!.id">
                            {{ historicalOption(line)!.name }} (archiviert)
                        </option>
                        <optgroup v-for="category in categories" :key="category.id" :label="category.name">
                            <option v-for="item in category.items" :key="item.id" :value="item.id">
                                {{ item.name }}
                            </option>
                        </optgroup>
                    </ui-select>
                </label>
                <label>
                    <span>Einzelpreis</span>
                    <input v-model.trim="line.price" required inputmode="decimal" placeholder="0,00">
                </label>
                <label>
                    <span>Menge</span>
                    <input v-model.number="line.quantity" required type="number" min="1" max="99">
                </label>
                <strong>{{ lineTotal(line) }}</strong>
                <ui-button tag="button" type="secondary" class="report-bon-editor_remove" aria-label="Position entfernen" :disabled="lines.length === 1" @click="removeLine(index)">
                    <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                </ui-button>
            </div>
        </div>

        <ui-button tag="button" type="secondary" class="report-bon-editor_add" @click="addLine">
            <Icon name="material-symbols:add-rounded" aria-hidden="true" /> Position hinzufügen
        </ui-button>

        <p v-if="error" class="report-bon-editor_error" role="alert">{{ error }}</p>
        <footer class="report-bon-editor_footer">
            <p>Bon gesamt <strong>{{ formatCents(totalCents) }}</strong></p>
            <div>
                <ui-button tag="button" type="secondary" class="report-bon-editor_cancel" :disabled="pending" @click="$emit('cancel')">Abbrechen</ui-button>
                <ui-button tag="button" button-type="submit" class="report-bon-editor_save" :disabled="pending">
                    {{ pending ? 'Wird gespeichert …' : submitLabel }}
                </ui-button>
            </div>
        </footer>
    </ui-form>
</template>

<script setup lang="ts">
import type { BonRecord, PaymentMethod as PaymentMethodType, StoreCategoryRecord } from '~~/types/store';
import { PaymentMethod } from '~~/types/store';
import { formatCents, parseEuroInput } from '~/utils/currency';

interface EditorLine {
    key: string;
    lineId?: string;
    itemId: string;
    historicalItem?: { id: string; name: string };
    price: string;
    quantity: number;
}

export interface ReportBonPayload {
    paymentMethod: PaymentMethodType;
    createdAt: string;
    items: Array<{ lineId?: string; itemId?: string; quantity: number; unitPriceCents: number }>;
}

const props = defineProps<{
    categories: StoreCategoryRecord[];
    bon?: BonRecord;
    defaultCreatedAt: string;
    minCreatedAt: string;
    maxCreatedAt: string;
    pending: boolean;
    error: string;
    submitLabel: string;
}>();

const emit = defineEmits<{
    submit: [payload: ReportBonPayload];
    cancel: [];
}>();

let nextKey = 0;
const allItems = computed(() => props.categories.flatMap(category => category.items));
const paymentMethod = ref<PaymentMethodType>(props.bon?.paymentMethod ?? PaymentMethod.Cash);
const createdAt = ref(toLocalDateTime(props.bon?.createdAt ?? props.defaultCreatedAt));
const lines = ref<EditorLine[]>(props.bon?.items.map(line => ({
    key: String(nextKey++),
    lineId: line.id,
    itemId: line.itemId ?? '',
    historicalItem: line.itemId ? { id: line.itemId, name: line.name } : undefined,
    price: euroString(line.unitPriceCents),
    quantity: line.quantity,
})) ?? [newLine()]);

const minDateTime = computed(() => toLocalDateTime(props.minCreatedAt));
const maxDateTime = computed(() => toLocalDateTime(props.maxCreatedAt));
const totalCents = computed(() => lines.value.reduce((sum, line) => sum + (parseEuroInput(line.price) ?? 0) * line.quantity, 0));

function euroString(cents: number) {
    return (cents / 100).toFixed(2).replace('.', ',');
}

function toLocalDateTime(value: string) {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function newLine(): EditorLine {
    const item = allItems.value[0];
    return {
        key: String(nextKey++),
        itemId: item?.id ?? '',
        price: euroString(item?.priceCents ?? 0),
        quantity: 1,
    };
}

function historicalOption(line: EditorLine) {
    if (!line.historicalItem || allItems.value.some(item => item.id === line.historicalItem!.id)) return null;
    return line.historicalItem;
}

function selectItem(line: EditorLine) {
    const item = allItems.value.find(entry => entry.id === line.itemId);
    if (!item) return;
    line.price = euroString(item.priceCents);
    line.historicalItem = undefined;
}

function addLine() {
    lines.value.push(newLine());
}

function removeLine(index: number) {
    if (lines.value.length > 1) lines.value.splice(index, 1);
}

function lineTotal(line: EditorLine) {
    return formatCents((parseEuroInput(line.price) ?? 0) * line.quantity);
}

function submit() {
    const items = lines.value.map(line => ({
        lineId: line.lineId,
        itemId: line.itemId || undefined,
        quantity: line.quantity,
        unitPriceCents: parseEuroInput(line.price),
    }));
    if (items.some(line => line.unitPriceCents === null)) return;

    emit('submit', {
        paymentMethod: paymentMethod.value,
        createdAt: new Date(createdAt.value).toISOString(),
        items: items.map(line => ({ ...line, unitPriceCents: line.unitPriceCents! })),
    });
}
</script>

<style scoped lang="scss">
.report-bon-editor {
    display: grid;
    gap: 0.85rem;

    padding: 0.85rem;
    border: 1px solid $secondary600;
    border-radius: 8px;

    background: $darkgray900;

    &_meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;

        label {
            flex: 1 1 13rem;
        }
    }

    label {
        display: grid;
        gap: 0.3rem;

        span {
            font-size: 0.7rem;
            font-weight: 700;
            color: $lightgray300;
        }
    }

    input {
        min-width: 0;
        min-height: 42px;
        padding: 0 0.65rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.82rem;
        color: $lightgray50;

        color-scheme: dark;
        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    &_lines {
        display: grid;
        gap: 0.45rem;
    }

    &_line {
        display: grid;
        grid-template-columns: minmax(12rem, 2fr) minmax(7rem, 0.8fr) 5rem auto 42px;
        gap: 0.5rem;
        align-items: end;

        padding-bottom: 0.45rem;
        border-bottom: 1px solid $darkgray800;

        > strong {
            align-self: center;

            min-width: 5rem;

            font-size: 0.82rem;
            color: $lightgray100;
            text-align: right;
        }
    }

    &_remove,
    &_add,
    &_cancel,
    &_save {
        cursor: pointer;

        min-height: 42px;
        border-radius: 8px;

        font: inherit;
        font-size: 0.8rem;
        font-weight: 700;

        &:focus-visible {
            outline: 2px solid $primary300;
            outline-offset: 2px;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }

    &_remove {
        display: grid;
        place-items: center;

        width: 42px;
        padding: 0;
        border: 1px solid $darkgray700;

        color: $error300;

        background: transparent;
    }

    &_add {
        display: inline-flex;
        gap: 0.35rem;
        align-items: center;
        justify-self: start;

        padding: 0 0.75rem;
        border: 1px solid $darkgray700;

        color: $lightgray200;

        background: transparent;
    }

    &_error {
        margin: 0;
        font-size: 0.8rem;
        color: $error300;
    }

    &_footer {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
        justify-content: space-between;

        p {
            margin: 0;
            font-size: 0.82rem;
            color: $lightgray300;

            strong {
                margin-left: 0.35rem;
                font-size: 1rem;
                color: $lightgray0;
            }
        }

        div {
            display: flex;
            gap: 0.5rem;
        }
    }

    &_cancel,
    &_save {
        padding: 0 0.9rem;
    }

    &_cancel {
        border: 1px solid $darkgray700;
        color: $lightgray200;
        background: transparent;
    }

    &_save {
        border: 0;
        color: $whiteOrig;
        background: $primary500;
    }
}

@include mobileOnly {
    .report-bon-editor_line {
        grid-template-columns: minmax(0, 1fr) 5rem 42px;

        .report-bon-editor_item {
            grid-column: 1 / -1;
        }

        > strong {
            display: none;
        }
    }
}
</style>