import { prisma } from '../utils/prisma';
import { buildFeedDescription, programVisibilityWhere } from '../utils/program';

const defaultLocation = 'Kino im Kasten, August-Bebel-Straße 20, 01219 Dresden';
const defaultRuntimeMinutes = 120;

function formatIcsDate(date: Date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\r|\n/g, '\\n');
}

function foldLine(line: string) {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;

    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let start = 0;
    let chunkLimit = 75;
    while (start < bytes.length) {
        let end = Math.min(start + chunkLimit, bytes.length);
        while (end > start && ((bytes[end] ?? 0) & 0xc0) === 0x80) end--;
        chunks.push(decoder.decode(bytes.slice(start, end)));
        start = end;
        chunkLimit = 74;
    }
    return chunks.join('\r\n ');
}

function icsLine(name: string, value: string) {
    return foldLine(`${name}:${escapeIcsText(value)}`);
}

export default defineEventHandler(async event => {
    const config = useRuntimeConfig(event);
    const siteUrl = config.public.siteUrl.replace(/\/+$/, '');
    const now = new Date();

    const entries = await prisma.programEntry.findMany({
        where: programVisibilityWhere(now),
        orderBy: { startsAt: 'asc' },
        take: 200,
    });

    const events = entries.flatMap(entry => {
        const start = entry.startsAt;
        const end = new Date(start.getTime() + (entry.runtimeMinutes ?? defaultRuntimeMinutes) * 60 * 1000);

        return [
            'BEGIN:VEVENT',
            icsLine('UID', `${entry.id}@kino-im-kasten.de`),
            icsLine('DTSTAMP', formatIcsDate(entry.updatedAt)),
            icsLine('DTSTART', formatIcsDate(start)),
            icsLine('DTEND', formatIcsDate(end)),
            icsLine('SUMMARY', entry.title),
            icsLine('DESCRIPTION', buildFeedDescription(entry)),
            icsLine('LOCATION', entry.venue ?? defaultLocation),
            icsLine('URL', `${siteUrl}/programm/${entry.id}`),
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT',
        ].join('\r\n');
    });

    const body = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kino im Kasten//Programm//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        icsLine('X-WR-CALNAME', 'Kino im Kasten – Programm'),
        icsLine('X-WR-CALDESC', 'Vorstellungen im Kino im Kasten Dresden'),
        'X-WR-TIMEZONE:Europe/Berlin',
        'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
        'X-PUBLISHED-TTL:PT6H',
        ...events,
        'END:VCALENDAR',
    ].join('\r\n');

    setResponseHeader(event, 'Content-Type', 'text/calendar; charset=utf-8');
    setResponseHeader(event, 'Content-Disposition', 'inline; filename="kino-im-kasten-programm.ics"');
    return body;
});
