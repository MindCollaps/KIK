import type { ProgramEntry } from '~~/types/program';

// Vorstellungen finden in Dresden statt: feste Zeitzone, damit Server (UTC)
// und Browser identisch formatieren und keine Hydration-Mismatches entstehen.
const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
});

const monthFormatter = new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
});

const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
});

export function formatProgramDate(value: string) {
    return dateFormatter.format(new Date(value));
}

export function formatProgramMonth(value: string) {
    return monthFormatter.format(new Date(value));
}

export function formatProgramPrice(entry: Pick<ProgramEntry, 'isFree' | 'priceCents'>) {
    if (entry.isFree) return 'Eintritt frei';
    if (entry.priceCents === null) return 'Preis vor Ort';
    return currencyFormatter.format(entry.priceCents / 100);
}