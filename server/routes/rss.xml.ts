import { prisma } from '../utils/prisma';
import { buildFeedDescription, programVisibilityWhere } from '../utils/program';

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default defineEventHandler(async event => {
    const config = useRuntimeConfig(event);
    const siteUrl = config.public.siteUrl.replace(/\/+$/, '');
    const now = new Date();

    const entries = await prisma.programEntry.findMany({
        where: programVisibilityWhere(now),
        include: { film: true },
        orderBy: { startsAt: 'asc' },
        take: 200,
    });

    const items = entries.map(entry => {
        const link = `${siteUrl}/programm/${entry.id}`;
        return [
            '  <item>',
            `    <title>${escapeXml(entry.film.title)}</title>`,
            `    <link>${escapeXml(link)}</link>`,
            `    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
            `    <pubDate>${entry.startsAt.toUTCString()}</pubDate>`,
            `    <description>${escapeXml(buildFeedDescription(entry))}</description>`,
            '  </item>',
        ].join('\n');
    });

    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '  <title>Kino im Kasten – Programm</title>',
        `  <link>${escapeXml(`${siteUrl}/programm`)}</link>`,
        '  <description>Aktuelle Vorstellungen im Kino im Kasten Dresden.</description>',
        '  <language>de-de</language>',
        `  <lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
        '  <generator>Kino im Kasten</generator>',
        `  <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
        ...items,
        '</channel>',
        '</rss>',
    ].join('\n');

    setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
    return body;
});
