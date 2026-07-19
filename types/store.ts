export const PaymentMethod = {
    Cash: 'CASH',
    Card: 'CARD',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const BonStatus = {
    Completed: 'COMPLETED',
    Cancelled: 'CANCELLED',
} as const;

export type BonStatus = (typeof BonStatus)[keyof typeof BonStatus];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: 'Bar',
    [PaymentMethod.Card]: 'Karte',
};

// Nummernpool: gemeinsamer Nummernkreis für mehrere Artikel
// (z. B. Kinokarte normal + ermäßigt vom selben Kartenblock)
export interface NumberPoolRecord {
    id: string;
    name: string;
    nextNumber: number | null;
}

export interface StoreItemRecord {
    id: string;
    categoryId: string;
    name: string;
    priceCents: number;
    freePrice: boolean;
    numberPoolId: string | null;
    numberPool: NumberPoolRecord | null;
    color: string | null;
    sortOrder: number;
    archived: boolean;
}

export interface StoreCategoryRecord {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    sortOrder: number;
    archived: boolean;
    items: StoreItemRecord[];
}

export interface BonItemRecord {
    id: string;
    itemId: string | null;
    name: string;
    unitPriceCents: number;
    quantity: number;
    firstNumber: number | null;
    lastNumber: number | null;
    numberPoolId: string | null;
}

export interface BonRecord {
    number: number;
    status: BonStatus;
    paymentMethod: PaymentMethod;
    totalCents: number;
    createdByName: string;
    createdAt: string;
    cancelledAt: string | null;
    cancelledByName: string | null;
    cancelReason: string | null;
    items: BonItemRecord[];
}

export interface BreakdownItem {
    name: string;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
}

export interface BreakdownCategory {
    categoryName: string;
    totalCents: number;
    items: BreakdownItem[];
}

// Nummernstand eines Nummernpools (z. B. Kinokarten) in einer Periode
export interface NumberedPoolStat {
    poolId: string;
    name: string;
    firstNumber: number;
    lastNumber: number;
    quantity: number;
}

export interface NumberedBreakdownEntry extends NumberedPoolStat {
    countedLastNumber: number;
    reason: string | null;
}

export interface PeriodStats {
    bonCount: number;
    stornoCount: number;
    stornoTotalCents: number;
    revenueCents: number;
    cashRevenueCents: number;
    cardRevenueCents: number;
    breakdown: BreakdownCategory[];
}

export interface TagesabschlussPreview {
    periodStart: string | null;
    suggestedOpeningCashCents: number;
    stats: PeriodStats;
    numberedPools: NumberedPoolStat[];
}

export interface TagesabschlussListEntry {
    number: number;
    periodStart: string;
    periodEnd: string;
    revenueCents: number;
    differenceCents: number;
    bonCount: number;
    stornoCount: number;
    createdByName: string;
    createdAt: string;
}

export interface TagesabschlussRecord extends TagesabschlussListEntry {
    openingCashCents: number;
    countedCashCents: number;
    expectedCashCents: number;
    cashRevenueCents: number;
    cardRevenueCents: number;
    stornoTotalCents: number;
    cashDifferenceReason: string | null;
    breakdown: BreakdownCategory[];
    numberedBreakdown: NumberedBreakdownEntry[];
    bons: BonRecord[];
}
