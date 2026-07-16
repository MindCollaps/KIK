export const pageStatuses = ['DRAFT', 'PUBLISHED'] as const;
export const pageThemeChoices = ['default', 'sommerkino', 'das-kino', 'glow', 'neon-grid', 'programm'] as const;
export const pageThemes = [...pageThemeChoices, 'landing', 'info'] as const;
export const blockTypes = ['infoHero', 'landingHero', 'programOverview', 'markdown', 'cardGrid', 'image', 'split', 'network'] as const;

export type PageStatus = typeof pageStatuses[number];
export type PageTheme = typeof pageThemes[number];
export type PageThemeChoice = typeof pageThemeChoices[number];
export type BlockType = typeof blockTypes[number];

export function resolvePageTheme(theme: string | null | undefined): PageThemeChoice {
    switch (theme) {
        case 'default':
        case 'sommerkino':
        case 'das-kino':
        case 'glow':
        case 'neon-grid':
        case 'programm':
            return theme;
        case 'landing':
            return 'glow';
        case 'info':
            return 'das-kino';
        default:
            return 'default';
    }
}

export interface BlockAction {
    label: string;
    to: string;
    style: 'primary' | 'secondary';
}

export interface InfoHeroBlock {
    id: string;
    type: 'infoHero';
    eyebrow: string;
    title: string;
    description: string | null;
    actions: BlockAction[];
}

export interface LandingHeroBlock {
    id: string;
    type: 'landingHero';
    eyebrow: string;
    title: string;
    lead: string | null;
    actions: BlockAction[];
    showNextScreening: boolean;
}

export interface ProgramOverviewBlock {
    id: string;
    type: 'programOverview';
    title: string;
    offset: number;
    limit: number;
    venueFilter?: string | null;
    linkLabel: string | null;
    linkTo: string | null;
}

export interface MarkdownBlock {
    id: string;
    type: 'markdown';
    title: string | null;
    content: string;
}

export interface CardGridBlock {
    id: string;
    type: 'cardGrid';
    title: string | null;
    cards: Array<{
        title: string;
        text: string;
        meta: string | null;
    }>;
}

export interface ImageBlock {
    id: string;
    type: 'image';
    title: string | null;
    src: string;
    alt: string;
    caption: string | null;
}

export interface SplitBlock {
    id: string;
    type: 'split';
    title: string;
    body: string;
    linkLabel: string | null;
    linkTo: string | null;
    points: string[];
}

export interface NetworkLink {
    label: string;
    url: string;
    icon: string | null;
}

export interface NetworkSupporter {
    label: string;
    url: string;
    image: string | null;
    icon: string | null;
    role: string | null;
}

export interface NetworkBlock {
    id: string;
    type: 'network';
    socialTitle: string;
    socialLinks: NetworkLink[];
    supportTitle: string;
    supportText: string | null;
    supporters: NetworkSupporter[];
}

export type PageBlock =
    | InfoHeroBlock
    | LandingHeroBlock
    | ProgramOverviewBlock
    | MarkdownBlock
    | CardGridBlock
    | ImageBlock
    | SplitBlock
    | NetworkBlock;

export interface PageContent {
    slug: string;
    title: string;
    description: string | null;
    theme: PageTheme;
    status: PageStatus;
    blocks: PageBlock[];
}

export interface PageRecord extends PageContent {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface NavigationItem {
    label: string;
    path: string;
    icon: string | null;
}

export interface NavigationConfig {
    items: NavigationItem[];
}

export interface FooterLink {
    label: string;
    to: string;
    icon: string | null;
}

export interface FooterGroup {
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    description: string;
    addressLabel: string | null;
    addressUrl: string | null;
    groups: FooterGroup[];
    bottomLeft: string;
    bottomRight: string;
}

export interface PageExport {
    kind: 'kik-page';
    version: 1;
    page: PageContent;
}

export interface SiteExport {
    kind: 'kik-site';
    version: 1;
    exportedAt: string;
    navigation: NavigationConfig;
    footer: FooterConfig;
    pages: PageContent[];
}
