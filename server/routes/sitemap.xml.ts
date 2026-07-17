import { prisma } from '../utils/prisma';
import { programVisibilityWhere } from '../utils/program';

function escapeXml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc: string, lastmod: Date, changefreq: string, priority: string) {
    return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod.toISOString()}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
    ].join('\n');
}

export default defineEventHandler(async event => {
    const config = useRuntimeConfig(event);
    const siteUrl = config.public.siteUrl.replace(/\/+$/, '');
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [pages, entries] = await Promise.all([
        prisma.page.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, updatedAt: true },
        }),
        prisma.programEntry.findMany({
            where: programVisibilityWhere(now),
            select: { id: true, startsAt: true, updatedAt: true },
            orderBy: { startsAt: 'asc' },
        }),
    ]);

    const pageUrls = pages.map(page => urlEntry(
        page.slug ? `${siteUrl}/${page.slug}` : `${siteUrl}/`,
        page.updatedAt,
        page.slug === '' ? 'daily' : 'weekly',
        page.slug === '' ? '1.0' : '0.6',
    ));

    const latestEntryUpdate = entries.reduce(
        (latest, entry) => entry.updatedAt > latest ? entry.updatedAt : latest,
        new Date(0),
    );
    const programListUrl = urlEntry(
        `${siteUrl}/programm`,
        entries.length ? latestEntryUpdate : now,
        'hourly',
        '0.9',
    );

    const entryUrls = entries.map(entry => {
        const isUpcomingSoon = entry.startsAt <= soon;
        return urlEntry(
            `${siteUrl}/programm/${entry.id}`,
            entry.updatedAt,
            isUpcomingSoon ? 'daily' : 'weekly',
            isUpcomingSoon ? '0.8' : '0.6',
        );
    });

    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...pageUrls,
        programListUrl,
        ...entryUrls,
        '</urlset>',
    ].join('\n');

    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return body;
});
