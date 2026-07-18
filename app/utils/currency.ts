export function formatCents(cents: number) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

// Akzeptiert Eingaben wie "4", "4,5", "4,50" oder "4.50" und liefert Cents
export function parseEuroInput(value: string): number | null {
    const normalized = value.trim().replace(/\s|€/g, '').replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    return Math.round(Number.parseFloat(normalized) * 100);
}
