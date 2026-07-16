import type { BlockType, PageBlock, PageContent } from '~~/types/content';
import { resolvePageTheme } from '~~/types/content';

export const blockTypeLabels: Record<BlockType, string> = {
    landingHero: 'Startseiten-Hero',
    infoHero: 'Seitenkopf',
    markdown: 'Textabschnitt',
    programOverview: 'Programmübersicht',
    cardGrid: 'Kartenraster',
    image: 'Bild',
    split: 'Text mit Punkteliste',
    network: 'Links & Unterstützer',
};

function blockId() {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `block-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function createBlock(type: BlockType): PageBlock {
    const id = blockId();

    switch (type) {
        case 'landingHero':
            return { id, type, eyebrow: 'Kino im Kasten', title: 'Neue Überschrift', lead: null, actions: [], showNextScreening: true };
        case 'infoHero':
            return { id, type, eyebrow: 'Kino im Kasten', title: 'Neue Seite', description: null, actions: [] };
        case 'markdown':
            return { id, type, title: 'Neuer Abschnitt', content: 'Text …' };
        case 'programOverview':
            return { id, type, title: 'Programm', offset: 0, limit: 4, venueFilter: null, linkLabel: 'Vollständiges Programm', linkTo: '/programm' };
        case 'cardGrid':
            return { id, type, title: 'Neuer Abschnitt', cards: [{ title: 'Karte', text: 'Beschreibung', meta: null }] };
        case 'image':
            return { id, type, title: null, src: '', alt: '', caption: null };
        case 'split':
            return { id, type, title: 'Neuer Abschnitt', body: 'Text …', linkLabel: null, linkTo: null, points: [] };
        case 'network':
            return { id, type, socialTitle: 'Social und Feeds', socialLinks: [], supportTitle: 'Unterstützung', supportText: null, supporters: [] };
    }
}

/**
 * Tiefe Kopie über JSON: Funktioniert im Gegensatz zu structuredClone auch
 * mit reaktiven Vue-Proxys und liefert garantiert serialisierbare Daten.
 */
export function clonePlain<Type>(value: Type): Type {
    return JSON.parse(JSON.stringify(value)) as Type;
}

/**
 * Bereinigt Formularwerte vor dem Speichern: Leere Strings werden zu null,
 * leere Einträge in String-Listen entfernt. IDs und Typen bleiben unberührt.
 */
export function normalizeContentValue<Type>(value: Type): Type {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return (trimmed === '' ? null : trimmed) as Type;
    }

    if (Array.isArray(value)) {
        return value
            .map(entry => normalizeContentValue(entry))
            .filter(entry => entry !== null) as Type;
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, normalizeContentValue(entry)]),
        ) as Type;
    }

    return value;
}

export function normalizePageContent(page: PageContent): PageContent {
    return {
        ...normalizeContentValue(page),
        slug: page.slug.trim().replace(/^\/+|\/+$/g, ''),
        theme: resolvePageTheme(page.theme),
        status: page.status,
    };
}

export function downloadJson(payload: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function emptyPage(): PageContent {
    return {
        slug: 'neue-seite',
        title: 'Neue Seite',
        description: null,
        theme: 'default',
        status: 'DRAFT',
        blocks: [],
    };
}
