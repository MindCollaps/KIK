import { z } from 'zod';
import type { FooterConfig, NavigationConfig, PageBlock, PageContent } from '~~/types/content';
import { blockTypes, pageStatuses, pageThemes } from '~~/types/content';

export const reservedSlugs = ['admin', 'programm', 'api', 'media', 'health', 'assets', 'uploads'];

const slugPattern = /^$|^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().min(1).max(max).nullable();
const linkTarget = shortText(1000);
const iconName = z.string().trim().regex(/^[a-z0-9-]+:[a-z0-9-]+$/i, 'Ungültiger Icon-Name.').max(120).nullable();

const blockAction = z.object({
    label: shortText(80),
    to: linkTarget,
    style: z.enum(['primary', 'secondary']),
});

const blockBase = {
    id: z.string().trim().min(1).max(64),
};

const infoHeroBlock = z.object({
    ...blockBase,
    type: z.literal('infoHero'),
    eyebrow: shortText(80),
    title: shortText(160),
    description: optionalText(500),
    actions: z.array(blockAction).max(4),
});

const landingHeroBlock = z.object({
    ...blockBase,
    type: z.literal('landingHero'),
    eyebrow: shortText(80),
    title: shortText(160),
    lead: optionalText(500),
    actions: z.array(blockAction).max(4),
    showNextScreening: z.boolean(),
});

const programOverviewBlock = z.object({
    ...blockBase,
    type: z.literal('programOverview'),
    title: shortText(160),
    offset: z.number().int().min(0).max(20),
    limit: z.number().int().min(1).max(20),
    venueFilter: optionalText(160).optional(),
    linkLabel: optionalText(80),
    linkTo: optionalText(1000),
});

const markdownBlock = z.object({
    ...blockBase,
    type: z.literal('markdown'),
    title: optionalText(160),
    content: z.string().trim().min(1).max(20000),
});

const cardGridBlock = z.object({
    ...blockBase,
    type: z.literal('cardGrid'),
    title: optionalText(160),
    cards: z.array(z.object({
        title: shortText(160),
        text: shortText(1000),
        meta: optionalText(200),
    })).min(1).max(12),
});

const imageBlock = z.object({
    ...blockBase,
    type: z.literal('image'),
    title: optionalText(160),
    src: shortText(1000),
    alt: shortText(300),
    caption: optionalText(300),
});

const splitBlock = z.object({
    ...blockBase,
    type: z.literal('split'),
    title: shortText(160),
    body: z.string().trim().min(1).max(10000),
    linkLabel: optionalText(80),
    linkTo: optionalText(1000),
    points: z.array(shortText(300)).max(10),
});

const networkLink = z.object({
    label: shortText(120),
    url: linkTarget,
    icon: iconName,
});

const networkSupporter = z.object({
    label: shortText(120),
    url: linkTarget,
    image: optionalText(1000),
    icon: iconName,
    role: optionalText(80),
});

const networkBlock = z.object({
    ...blockBase,
    type: z.literal('network'),
    socialTitle: shortText(120),
    socialLinks: z.array(networkLink).max(12),
    supportTitle: shortText(120),
    supportText: optionalText(500),
    supporters: z.array(networkSupporter).max(12),
});

export const pageBlockSchema = z.discriminatedUnion('type', [
    infoHeroBlock,
    landingHeroBlock,
    programOverviewBlock,
    markdownBlock,
    cardGridBlock,
    imageBlock,
    splitBlock,
    networkBlock,
]);

export const pageContentSchema = z.object({
    slug: z.string().trim().max(200).regex(slugPattern, 'Der Pfad darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.')
        .refine(slug => !reservedSlugs.includes(slug.split('/')[0] ?? ''), 'Dieser Pfad ist für das System reserviert.'),
    title: shortText(160),
    description: optionalText(300),
    theme: z.enum(pageThemes),
    status: z.enum(pageStatuses),
    blocks: z.array(pageBlockSchema).max(50),
}) satisfies z.ZodType<PageContent>;

export const navigationSchema = z.object({
    items: z.array(z.object({
        label: shortText(60),
        path: linkTarget,
        icon: iconName,
    })).max(12),
}) satisfies z.ZodType<NavigationConfig>;

export const footerSchema = z.object({
    description: shortText(300),
    addressLabel: optionalText(200),
    addressUrl: optionalText(1000),
    groups: z.array(z.object({
        title: shortText(60),
        links: z.array(z.object({
            label: shortText(80),
            to: linkTarget,
            icon: iconName,
        })).max(10),
    })).max(4),
    bottomLeft: shortText(200),
    bottomRight: shortText(200),
}) satisfies z.ZodType<FooterConfig>;

export const pageExportSchema = z.object({
    kind: z.literal('kik-page'),
    version: z.literal(1),
    page: pageContentSchema,
});

export const siteExportSchema = z.object({
    kind: z.literal('kik-site'),
    version: z.literal(1),
    exportedAt: z.string().optional(),
    navigation: navigationSchema,
    footer: footerSchema,
    pages: z.array(pageContentSchema).max(200),
});

export const settingKeys = ['navigation', 'footer'] as const;
export type SettingKey = typeof settingKeys[number];

export const settingSchemas: Record<SettingKey, z.ZodType> = {
    navigation: navigationSchema,
    footer: footerSchema,
};

export function firstIssueMessage(error: z.ZodError, fallback: string) {
    return error.issues[0]?.message ?? fallback;
}

export function ensureUniqueBlockIds(blocks: PageBlock[]) {
    const seen = new Set<string>();
    for (const block of blocks) {
        if (seen.has(block.id)) {
            throw createError({ statusCode: 400, statusMessage: 'Blöcke benötigen eindeutige IDs.' });
        }
        seen.add(block.id);
    }
}

export { blockTypes };
