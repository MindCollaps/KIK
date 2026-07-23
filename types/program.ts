import type { DoesTheDogDieTopicId } from './does-the-dog-die-topics';

export const programStatuses = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN'] as const;
export const programStyles = ['DEFAULT', 'SPECIAL', 'HIGHLIGHTED', 'CUSTOM'] as const;

export type ProgramStatus = typeof programStatuses[number];
export type ProgramStyle = typeof programStyles[number];

export type ContentWarningStat = {
    topicId: DoesTheDogDieTopicId;
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

// Ein Film bleibt dauerhaft in der Datenbank, auch wenn er gerade nicht im
// Programm läuft. Er muss einmal angelegt werden, bevor er im Programm
// ausgewählt werden kann.
export interface Film {
    id: string;
    title: string;
    description: string;
    runtimeMinutes: number | null;
    ageRating: string | null;
    director: string | null;
    country: string | null;
    releaseYear: number | null;
    infoUrl: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    doesTheDogDieId: number | null;
    contentWarnings: ContentWarningSnapshot | null;
    contentWarningsUpdatedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FilmInput {
    title: string;
    description: string;
    runtimeMinutes: number | null;
    ageRating: string | null;
    director: string | null;
    country: string | null;
    releaseYear: number | null;
    infoUrl: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    doesTheDogDieId: number | null;
}

// Wie oft und wann ein Film bereits gezeigt wurde, abgeleitet aus vergangenen
// Programmeinträgen. Grundlage für die Sortierung in der Filmverwaltung.
export interface FilmWithStats extends Film {
    timesShown: number;
    lastShownAt: string | null;
}

export const filmSortModes = ['title', 'lastShown', 'timesShown'] as const;
export type FilmSortMode = typeof filmSortModes[number];

// Eine Vorstellung ist nur noch der Termin für einen existierenden Film;
// die Filmdaten selbst liegen auf `film`.
export interface ProgramEntry {
    id: string;
    filmId: string;
    film: Film;
    startsAt: string;
    venue: string | null;
    language: string | null;
    priceCents: number | null;
    isFree: boolean;
    style: ProgramStyle;
    highlightColor: string | null;
    customBadgeText: string | null;
    customBadgeBorder: boolean;
    customBadgeIcon: string | null;
    customCardBorder: boolean;
    status: ProgramStatus;
    visibleFrom: string | null;
    visibleUntil: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProgramEntryInput {
    filmId: string;
    startsAt: string;
    venue: string | null;
    language: string | null;
    priceCents: number | null;
    isFree: boolean;
    style: ProgramStyle;
    highlightColor: string | null;
    customBadgeText: string | null;
    customBadgeBorder: boolean;
    customBadgeIcon: string | null;
    customCardBorder: boolean;
    status: ProgramStatus;
    visibleFrom: string | null;
    visibleUntil: string | null;
}

export interface ProgramExport {
    kind: 'kik-program';
    version: 2;
    exportedAt?: string;
    films: (FilmInput & { id?: string })[];
    entries: (ProgramEntryInput & { id?: string })[];
}
