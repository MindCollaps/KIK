import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).nullable();
const optionalDate = z.string().datetime({ offset: true }).nullable();

export const programEntrySchema = z.object({
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
    imagePath: z.string().regex(/^\/media\/[a-zA-Z0-9._-]+$/).nullable(),
    imageAlt: optionalText(240),
    doesTheDogDieId: z.number().int().positive().nullable(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN']),
    visibleFrom: optionalDate,
    visibleUntil: optionalDate,
}).superRefine((entry, context) => {
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
});

export function toProgramData(input: z.infer<typeof programEntrySchema>) {
    return {
        ...input,
        startsAt: new Date(input.startsAt),
        visibleFrom: input.visibleFrom ? new Date(input.visibleFrom) : null,
        visibleUntil: input.visibleUntil ? new Date(input.visibleUntil) : null,
        priceCents: input.isFree ? null : input.priceCents,
        highlightColor: input.style === 'HIGHLIGHTED' ? (input.highlightColor ?? '#D7AC5C') : null,
        customBadgeText: input.style === 'CUSTOM' ? input.customBadgeText : null,
        customBadgeBorder: input.style === 'CUSTOM' ? input.customBadgeBorder : false,
    };
}