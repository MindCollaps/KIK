export const programStatuses = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN'] as const;
export const programStyles = ['DEFAULT', 'SPECIAL', 'HIGHLIGHTED', 'CUSTOM'] as const;

export type ProgramStatus = typeof programStatuses[number];
export type ProgramStyle = typeof programStyles[number];

export type ContentWarningStat = {
    topicId: number;
    topicName: string;
    yesSum: number;
    noSum: number;
    numComments: number;
};

export type ContentWarningSnapshot = {
    itemId: number;
    name: string;
    releaseYear: number | null;
    overview: string | null;
    posterImage: string | null;
    fetchedAt: string;
    stats: ContentWarningStat[];
};

export interface DoesTheDogDieSearchResult {
    id: number;
    name: string;
    releaseYear: number | null;
    itemTypeName: string;
    posterImage: string | null;
    overview: string | null;
}

export interface ProgramEntry {
    id: string;
    title: string;
    description: string;
    startsAt: string;
    venue: string | null;
    language: string | null;
    runtimeMinutes: number | null;
    ageRating: string | null;
    director: string | null;
    country: string | null;
    releaseYear: number | null;
    infoUrl: string | null;
    priceCents: number | null;
    isFree: boolean;
    style: ProgramStyle;
    highlightColor: string | null;
    customBadgeText: string | null;
    customBadgeBorder: boolean;
    customBadgeIcon: string | null;
    customCardBorder: boolean;
    imagePath: string | null;
    imageAlt: string | null;
    doesTheDogDieId: number | null;
    contentWarnings: ContentWarningSnapshot | null;
    contentWarningsUpdatedAt: string | null;
    status: ProgramStatus;
    visibleFrom: string | null;
    visibleUntil: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProgramEntryInput {
    title: string;
    description: string;
    startsAt: string;
    venue: string | null;
    language: string | null;
    runtimeMinutes: number | null;
    ageRating: string | null;
    director: string | null;
    country: string | null;
    releaseYear: number | null;
    infoUrl: string | null;
    priceCents: number | null;
    isFree: boolean;
    style: ProgramStyle;
    highlightColor: string | null;
    customBadgeText: string | null;
    customBadgeBorder: boolean;
    customBadgeIcon: string | null;
    customCardBorder: boolean;
    imagePath: string | null;
    imageAlt: string | null;
    doesTheDogDieId: number | null;
    status: ProgramStatus;
    visibleFrom: string | null;
    visibleUntil: string | null;
}

export interface ProgramExport {
    kind: 'kik-program';
    version: 1;
    exportedAt?: string;
    entries: (ProgramEntryInput & { id?: string })[];
}