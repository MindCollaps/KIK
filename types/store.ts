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

export interface StoreItemRecord {
    id: string;
    categoryId: string;
    name: string;
    priceCents: number;
    freePrice: boolean;
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
    breakdown: BreakdownCategory[];
    bons: BonRecord[];
}
