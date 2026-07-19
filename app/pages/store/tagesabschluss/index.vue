<template>
    <main class="abschluss-page">
        <store-header title="Tagesabschlüsse" />
        <views-view-version/>

        <div class="abschluss-layout">
            <p v-if="!entries.length" class="abschluss-empty">Es wurden noch keine Tagesabschlüsse erstellt.</p>

            <div v-else class="abschluss-table-wrap">
                <table class="abschluss-table">
                    <thead>
                        <tr>
                            <th>Nr.</th>
                            <th>Zeitraum</th>
                            <th>Bons</th>
                            <th>Storno</th>
                            <th>Umsatz</th>
                            <th>Differenz</th>
                            <th>Erstellt von</th>
                            <th aria-label="Aktionen" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in entries" :key="entry.number">
                            <td>#{{ entry.number }}</td>
                            <td>{{ formatDateTime(entry.periodStart) }} – {{ formatDateTime(entry.periodEnd) }}</td>
                            <td>{{ entry.bonCount }}</td>
                            <td>{{ entry.stornoCount }}</td>
                            <td>{{ formatCents(entry.revenueCents) }}</td>
                            <td :class="{ 'abschluss-table_diff': entry.differenceCents !== 0 }">{{ formatCents(entry.differenceCents) }}</td>
                            <td>{{ entry.createdByName }}</td>
                            <td>
                                <ui-button :to="`/store/tagesabschluss/${entry.number}`" type="link" class="abschluss-table_link">
                                    Ansehen
                                </ui-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import type { TagesabschlussListEntry } from '~~/types/store';
import { requireStorePermission } from '~/composables/storeAccess';
import { usePageSeo } from '~/composables/seo';
import { formatCents } from '~/utils/currency';

definePageMeta({ layout: 'empty' });
usePageSeo(() => ({ title: 'Tagesabschlüsse', noindex: true }));

await requireStorePermission(Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage);

const requestFetch = useRequestFetch();
const response = await requestFetch<{ entries: TagesabschlussListEntry[] }>('/api/store/tagesabschluss');
const entries = ref(response.entries);

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    }).format(new Date(value));
}
</script>

<style scoped lang="scss">
.abschluss-page {
    min-height: 100dvh;
    color: $lightgray150;
    background: $darkgray1000;
}

.abschluss-layout {
    width: min(980px, 100%);
    margin: 0 auto;
    padding: 1.25rem;
}

.abschluss-empty {
    color: $lightgray400;
}

.abschluss-table-wrap {
    overflow-x: auto;
    border: 1px solid $darkgray800;
    border-radius: 12px;
    background: $darkgray950;
}

.abschluss-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;

    th,
    td {
        padding: 0.65rem 0.85rem;
        text-align: left;
        white-space: nowrap;
    }

    thead th {
        border-bottom: 1px solid $darkgray800;

        font-size: 0.7rem;
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

    &_diff {
        color: $error300;
    }

    &_link {
        color: $secondary300;
        text-decoration: underline;

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

@include mobileOnly {
    .abschluss-layout {
        padding: 0.9rem;
    }
}
</style>
