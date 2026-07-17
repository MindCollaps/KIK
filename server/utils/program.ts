import { z } from 'zod';
import type { ProgramEntry } from '../../types/program';

const optionalText = (max: number) => z.string().trim().max(max).nullable();
const optionalDate = z.string().datetime({ offset: true }).nullable();

const programEntryBaseSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(4000),
    startsAt: z.string().datetime({ offset: true }),
    venue: optionalText(160),
    language: optionalText(80),
    runtimeMinutes: z.number().int().min(1).max(600).nullable(),
    ageRating: optionalText(40),
    director: optionalText(160),
    country: optionalText(120),
    releaseYear: z.number().int().min(1888).max(2200).nullable(),
    infoUrl: z.string().url().max(1000).nullable(),
    priceCents: z.number().int().min(0).max(100000).nullable(),
    isFree: z.boolean(),
    style: z.enum(['DEFAULT', 'SPECIAL', 'HIGHLIGHTED', 'CUSTOM']),
    highlightColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
    customBadgeText: optionalText(48),
    customBadgeBorder: z.boolean(),
    customBadgeIcon: optionalText(80),
    customCardBorder: z.boolean(),
    imagePath: z.string().regex(/^\/media\/[a-zA-Z0-9._-]+$/).nullable(),
    imageAlt: optionalText(240),
    doesTheDogDieId: z.number().int().positive().nullable(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN']),
    visibleFrom: optionalDate,
    visibleUntil: optionalDate,
});

function programEntryChecks(entry: z.infer<typeof programEntryBaseSchema>, context: z.RefinementCtx) {
    if (entry.status === 'SCHEDULED' && !entry.visibleFrom) {
        context.addIssue({
            code: 'custom',
            path: ['visibleFrom'],
            message: 'Geplante Einträge benötigen einen Veröffentlichungszeitpunkt.',
        });
    }

    if (entry.visibleFrom && entry.visibleUntil && new Date(entry.visibleUntil) <= new Date(entry.visibleFrom)) {
        context.addIssue({
            code: 'custom',
            path: ['visibleUntil'],
            message: 'Das Sichtbarkeitsende muss nach dem Start liegen.',
        });
    }

    if (entry.style === 'CUSTOM' && !entry.customBadgeText) {
        context.addIssue({
            code: 'custom',
            path: ['customBadgeText'],
            message: 'Bitte gib einen Text fuer den Custom-Badge an.',
        });
    }
}

export const programEntrySchema = programEntryBaseSchema.superRefine(programEntryChecks);

export const programExportSchema = z.object({
    kind: z.literal('kik-program'),
    version: z.literal(1),
    exportedAt: z.string().optional(),
    entries: z.array(
        programEntryBaseSchema.extend({ id: z.string().uuid().optional() }).superRefine(programEntryChecks),
    ).max(1000),
});

export function programVisibilityWhere(now: Date) {
    return {
        startsAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
        OR: [
            { status: 'PUBLISHED' as const },
            {
                status: 'SCHEDULED' as const,
                visibleFrom: { lte: now },
                AND: [
                    { OR: [{ visibleUntil: null }, { visibleUntil: { gt: now } }] },
                ],
            },
        ],
    };
}

const feedCurrencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export function formatFeedPrice(entry: Pick<ProgramEntry, 'isFree' | 'priceCents'>) {
    if (entry.isFree) return 'Eintritt frei';
    if (entry.priceCents === null) return 'Preis vor Ort';
    return feedCurrencyFormatter.format(entry.priceCents / 100);
}

export function buildFeedDescription(entry: Pick<ProgramEntry, 'description' | 'venue' | 'language' | 'runtimeMinutes' | 'director' | 'releaseYear' | 'isFree' | 'priceCents'>) {
    const meta: string[] = [];
    if (entry.venue) meta.push(`Ort: ${entry.venue}`);
    if (entry.runtimeMinutes) meta.push(`Laufzeit: ${entry.runtimeMinutes} Min.`);
    if (entry.language) meta.push(`Sprache: ${entry.language}`);
    if (entry.director) meta.push(`Regie: ${entry.director}`);
    if (entry.releaseYear) meta.push(`Jahr: ${entry.releaseYear}`);
    meta.push(`Eintritt: ${formatFeedPrice(entry)}`);
    return [entry.description.trim(), meta.join(' · ')].filter(Boolean).join('\n\n');
}

export function toProgramData(input: z.infer<typeof programEntrySchema>) {
    return {
        ...input,
        startsAt: new Date(input.startsAt),
        visibleFrom: input.visibleFrom ? new Date(input.visibleFrom) : null,
        visibleUntil: input.visibleUntil ? new Date(input.visibleUntil) : null,
        priceCents: input.isFree ? null : input.priceCents,
        highlightColor: input.style === 'HIGHLIGHTED' || input.style === 'CUSTOM' ? (input.highlightColor ?? '#D7AC5C') : null,
        customBadgeText: input.style === 'CUSTOM' ? input.customBadgeText : null,
        customBadgeBorder: input.style === 'CUSTOM' ? input.customBadgeBorder : false,
        customBadgeIcon: input.style === 'CUSTOM' ? input.customBadgeIcon : null,
        customCardBorder: input.style === 'CUSTOM' ? input.customCardBorder : false,
    };
}