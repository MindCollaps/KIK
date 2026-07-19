import ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake/src/printer.js';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type { Prisma } from '@prisma/client';
import type { BreakdownCategory, NumberedBreakdownEntry, ShownFilmEntry } from '~~/types/store';
import { paymentMethodLabels } from '~~/types/store';
import { prisma } from './prisma';
import { siteName } from './mail';
import { bonInclude, formatDateTimeBerlin, formatEuro, toBonResponse } from './store';

export type AbschlussWithBons = Prisma.TagesabschlussGetPayload<{
    include: { bons: { include: { items: { include: { item: { include: { category: true } } } } } } };
}>;

export async function loadTagesabschluss(number: number): Promise<AbschlussWithBons | null> {
    return prisma.tagesabschluss.findUnique({
        where: { number },
        include: { bons: { include: bonInclude, orderBy: { number: 'asc' } } },
    });
}

export function abschlussBreakdown(abschluss: AbschlussWithBons): BreakdownCategory[] {
    // Der Breakdown wird beim Abschluss als unveränderlicher Snapshot gespeichert
    return (Array.isArray(abschluss.breakdown) ? abschluss.breakdown : []) as unknown as BreakdownCategory[];
}

export function abschlussNumbered(abschluss: AbschlussWithBons): NumberedBreakdownEntry[] {
    return (Array.isArray(abschluss.numberedBreakdown) ? abschluss.numberedBreakdown : []) as unknown as NumberedBreakdownEntry[];
}

export function abschlussShownFilms(abschluss: AbschlussWithBons): ShownFilmEntry[] {
    const value = Array.isArray(abschluss.shownFilms) ? abschluss.shownFilms : [];
    return value as ShownFilmEntry[];
}

export function toAbschlussResponse(abschluss: AbschlussWithBons) {
    return {
        number: abschluss.number,
        periodStart: abschluss.periodStart,
        periodEnd: abschluss.periodEnd,
        openingCashCents: abschluss.openingCashCents,
        countedCashCents: abschluss.countedCashCents,
        expectedCashCents: abschluss.expectedCashCents,
        differenceCents: abschluss.differenceCents,
        revenueCents: abschluss.revenueCents,
        cashRevenueCents: abschluss.cashRevenueCents,
        cardRevenueCents: abschluss.cardRevenueCents,
        bonCount: abschluss.bonCount,
        stornoCount: abschluss.stornoCount,
        stornoTotalCents: abschluss.stornoTotalCents,
        cashDifferenceReason: abschluss.cashDifferenceReason,
        breakdown: abschlussBreakdown(abschluss),
        numberedBreakdown: abschlussNumbered(abschluss),
        shownFilms: abschlussShownFilms(abschluss),
        createdByName: abschluss.createdByName,
        createdAt: abschluss.createdAt,
        bons: abschluss.bons.map(toBonResponse),
    };
}

interface ShownFilmSummary {
    filmId: string;
    title: string;
    count: number;
    startsAt: string[];
}

// Fasst die Rohliste der Vorführungen pro Film zusammen (Anzahl + Zeitpunkte),
// alphabetisch sortiert.
function summarizeShownFilms(abschluss: AbschlussWithBons): ShownFilmSummary[] {
    const byFilm = new Map<string, ShownFilmSummary>();
    for (const screening of abschlussShownFilms(abschluss)) {
        const entry = byFilm.get(screening.filmId) ?? { filmId: screening.filmId, title: screening.title, count: 0, startsAt: [] };
        entry.count += 1;
        entry.startsAt.push(screening.startsAt);
        byFilm.set(screening.filmId, entry);
    }
    return [...byFilm.values()].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

function euroValue(cents: number) {
    return (cents / 100).toFixed(2).replace('.', ',');
}

function csvField(value: string | number) {
    const text = String(value);
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRow(...values: Array<string | number>) {
    return values.map(csvField).join(';');
}

function numberRange(item: { firstNumber: number | null; lastNumber: number | null }) {
    if (item.firstNumber === null || item.lastNumber === null) return '';
    return item.firstNumber === item.lastNumber ? `Nr. ${item.firstNumber}` : `Nr. ${item.firstNumber}–${item.lastNumber}`;
}

function bonPositions(bon: AbschlussWithBons['bons'][number]) {
    return bon.items
        .map(item => {
            const range = numberRange(item);
            return `${item.quantity} × ${item.name}${range ? ` (${range})` : ''} à ${formatEuro(item.unitPriceCents)}`;
        })
        .join('; ');
}

interface SummaryRow {
    label: string;
    value: string;
}

function summaryRows(abschluss: AbschlussWithBons): SummaryRow[] {
    return [
        { label: 'Zeitraum von', value: formatDateTimeBerlin(abschluss.periodStart) },
        { label: 'Zeitraum bis', value: formatDateTimeBerlin(abschluss.periodEnd) },
        { label: 'Erstellt von', value: abschluss.createdByName },
        { label: 'Erstellt am', value: formatDateTimeBerlin(abschluss.createdAt) },
        { label: 'Anzahl Bons', value: String(abschluss.bonCount) },
        { label: 'Umsatz gesamt', value: formatEuro(abschluss.revenueCents) },
        { label: 'Umsatz Bar', value: formatEuro(abschluss.cashRevenueCents) },
        { label: 'Umsatz Karte', value: formatEuro(abschluss.cardRevenueCents) },
        { label: 'Stornierte Bons', value: String(abschluss.stornoCount) },
        { label: 'Stornobetrag', value: formatEuro(abschluss.stornoTotalCents) },
        { label: 'Kassenbestand Beginn', value: formatEuro(abschluss.openingCashCents) },
        { label: 'Kassenbestand erwartet', value: formatEuro(abschluss.expectedCashCents) },
        { label: 'Kassenbestand gezählt', value: formatEuro(abschluss.countedCashCents) },
        { label: 'Kassendifferenz', value: formatEuro(abschluss.differenceCents) },
        ...abschluss.cashDifferenceReason ? [{ label: 'Grund Kassendifferenz', value: abschluss.cashDifferenceReason }] : [],
    ];
}

export function buildCsv(abschluss: AbschlussWithBons) {
    const lines: string[] = [];
    lines.push(csvRow(`${siteName} – Tagesabschluss Nr. ${abschluss.number}`));
    lines.push('');
    for (const row of summaryRows(abschluss)) {
        lines.push(csvRow(row.label, row.value));
    }

    lines.push('');
    lines.push(csvRow('Verkaufte Artikel'));
    lines.push(csvRow('Kategorie', 'Artikel', 'Einzelpreis (EUR)', 'Menge', 'Summe (EUR)'));
    for (const category of abschlussBreakdown(abschluss)) {
        for (const item of category.items) {
            lines.push(csvRow(category.categoryName, item.name, euroValue(item.unitPriceCents), item.quantity, euroValue(item.totalCents)));
        }
        lines.push(csvRow(category.categoryName, 'Gesamt', '', '', euroValue(category.totalCents)));
    }

    const numbered = abschlussNumbered(abschluss);
    if (numbered.length) {
        lines.push('');
        lines.push(csvRow('Nummernpools'));
        lines.push(csvRow('Pool', 'Erste Nr.', 'Letzte Nr. (erwartet)', 'Letzte Nr. (gezählt)', 'Stückzahl', 'Grund'));
        for (const entry of numbered) {
            lines.push(csvRow(entry.name, entry.firstNumber, entry.lastNumber, entry.countedLastNumber, entry.quantity, entry.reason ?? ''));
        }
    }

    const shownFilms = summarizeShownFilms(abschluss);
    if (shownFilms.length) {
        lines.push('');
        lines.push(csvRow('Gezeigte Filme'));
        lines.push(csvRow('Film', 'Anzahl Vorführungen', 'Vorführzeiten'));
        for (const film of shownFilms) {
            lines.push(csvRow(film.title, film.count, film.startsAt.map(value => formatDateTimeBerlin(new Date(value))).join('; ')));
        }
    }

    lines.push('');
    lines.push(csvRow('Bons'));
    lines.push(csvRow('Bon-Nr.', 'Zeitpunkt', 'Zahlungsart', 'Status', 'Positionen', 'Betrag (EUR)', 'Erstellt von', 'Storniert von', 'Storniert am', 'Stornogrund'));
    for (const bon of abschluss.bons) {
        lines.push(csvRow(
            bon.number,
            formatDateTimeBerlin(bon.createdAt),
            paymentMethodLabels[bon.paymentMethod],
            bon.status === 'CANCELLED' ? 'Storniert' : 'Abgeschlossen',
            bonPositions(bon),
            euroValue(bon.totalCents),
            bon.createdByName,
            bon.cancelledByName ?? '',
            bon.cancelledAt ? formatDateTimeBerlin(bon.cancelledAt) : '',
            bon.cancelReason ?? '',
        ));
    }

    // BOM, damit Excel Umlaute korrekt erkennt
    return `${'\uFEFF'}${lines.join('\r\n')}`;
}

export async function buildXlsx(abschluss: AbschlussWithBons) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = siteName;
    workbook.created = new Date();

    const euroFormat = '#,##0.00 "€"';

    const overview = workbook.addWorksheet('Übersicht');
    overview.columns = [{ width: 28 }, { width: 24 }];
    overview.addRow([`${siteName} – Tagesabschluss Nr. ${abschluss.number}`]).font = { bold: true, size: 14 };
    overview.addRow([]);
    for (const row of summaryRows(abschluss)) {
        overview.addRow([row.label, row.value]);
    }

    const itemsSheet = workbook.addWorksheet('Artikel');
    itemsSheet.columns = [{ width: 20 }, { width: 32 }, { width: 16 }, { width: 10 }, { width: 16 }];
    itemsSheet.addRow(['Kategorie', 'Artikel', 'Einzelpreis', 'Menge', 'Summe']).font = { bold: true };
    for (const category of abschlussBreakdown(abschluss)) {
        for (const item of category.items) {
            const row = itemsSheet.addRow([category.categoryName, item.name, item.unitPriceCents / 100, item.quantity, item.totalCents / 100]);
            row.getCell(3).numFmt = euroFormat;
            row.getCell(5).numFmt = euroFormat;
        }
        const totalRow = itemsSheet.addRow([category.categoryName, 'Gesamt', '', '', category.totalCents / 100]);
        totalRow.font = { bold: true };
        totalRow.getCell(5).numFmt = euroFormat;
    }

    const numbered = abschlussNumbered(abschluss);
    if (numbered.length) {
        const numberedSheet = workbook.addWorksheet('Nummernpools');
        numberedSheet.columns = [{ width: 32 }, { width: 12 }, { width: 20 }, { width: 20 }, { width: 12 }, { width: 40 }];
        numberedSheet.addRow(['Pool', 'Erste Nr.', 'Letzte Nr. (erwartet)', 'Letzte Nr. (gezählt)', 'Stückzahl', 'Grund']).font = { bold: true };
        for (const entry of numbered) {
            numberedSheet.addRow([entry.name, entry.firstNumber, entry.lastNumber, entry.countedLastNumber, entry.quantity, entry.reason ?? '']);
        }
    }

    const shownFilms = summarizeShownFilms(abschluss);
    if (shownFilms.length) {
        const filmsSheet = workbook.addWorksheet('Gezeigte Filme');
        filmsSheet.columns = [{ width: 32 }, { width: 20 }, { width: 60 }];
        filmsSheet.addRow(['Film', 'Anzahl Vorführungen', 'Vorführzeiten']).font = { bold: true };
        for (const film of shownFilms) {
            filmsSheet.addRow([film.title, film.count, film.startsAt.map(value => formatDateTimeBerlin(new Date(value))).join('; ')]);
        }
    }

    const bonSheet = workbook.addWorksheet('Bons');
    bonSheet.columns = [{ width: 10 }, { width: 18 }, { width: 10 }, { width: 14 }, { width: 48 }, { width: 12 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 32 }];
    bonSheet.addRow(['Bon-Nr.', 'Zeitpunkt', 'Zahlungsart', 'Status', 'Positionen', 'Betrag', 'Erstellt von', 'Storniert von', 'Storniert am', 'Stornogrund']).font = { bold: true };
    for (const bon of abschluss.bons) {
        const row = bonSheet.addRow([
            bon.number,
            formatDateTimeBerlin(bon.createdAt),
            paymentMethodLabels[bon.paymentMethod],
            bon.status === 'CANCELLED' ? 'Storniert' : 'Abgeschlossen',
            bonPositions(bon),
            bon.totalCents / 100,
            bon.createdByName,
            bon.cancelledByName ?? '',
            bon.cancelledAt ? formatDateTimeBerlin(bon.cancelledAt) : '',
            bon.cancelReason ?? '',
        ]);
        row.getCell(6).numFmt = euroFormat;
        row.getCell(5).alignment = { wrapText: true, vertical: 'top' };
    }

    const bonItemsSheet = workbook.addWorksheet('Bon-Positionen');
    bonItemsSheet.columns = [
        { width: 10 },
        { width: 18 },
        { width: 12 },
        { width: 14 },
        { width: 32 },
        { width: 16 },
        { width: 10 },
        { width: 16 },
    ];
    bonItemsSheet.addRow([
        'Bon-Nr.',
        'Zeitpunkt',
        'Zahlungsart',
        'Status',
        'Artikel',
        'Einzelpreis',
        'Menge',
        'Summe',
    ]).font = { bold: true };
    for (const bon of abschluss.bons) {
        for (const item of bon.items) {
            const row = bonItemsSheet.addRow([
                bon.number,
                formatDateTimeBerlin(bon.createdAt),
                paymentMethodLabels[bon.paymentMethod],
                bon.status === 'CANCELLED' ? 'Storniert' : 'Abgeschlossen',
                item.name,
                item.unitPriceCents / 100,
                item.quantity,
                item.unitPriceCents * item.quantity / 100,
            ]);
            row.getCell(6).numFmt = euroFormat;
            row.getCell(8).numFmt = euroFormat;
        }
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function buildPdf(abschluss: AbschlussWithBons) {
    const printer = new PdfPrinter({
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
        },
    });

    const itemRows: TableCell[][] = [[
        { text: 'Kategorie', bold: true },
        { text: 'Artikel', bold: true },
        { text: 'Einzelpreis', bold: true, alignment: 'right' },
        { text: 'Menge', bold: true, alignment: 'right' },
        { text: 'Summe', bold: true, alignment: 'right' },
    ]];
    for (const category of abschlussBreakdown(abschluss)) {
        for (const item of category.items) {
            itemRows.push([
                category.categoryName,
                item.name,
                { text: formatEuro(item.unitPriceCents), alignment: 'right' },
                { text: String(item.quantity), alignment: 'right' },
                { text: formatEuro(item.totalCents), alignment: 'right' },
            ]);
        }
        itemRows.push([
            { text: category.categoryName, bold: true },
            { text: 'Gesamt', bold: true },
            '',
            '',
            { text: formatEuro(category.totalCents), bold: true, alignment: 'right' },
        ]);
    }

    const bonRows: TableCell[][] = [[
        { text: 'Nr.', bold: true },
        { text: 'Zeitpunkt', bold: true },
        { text: 'Zahlart', bold: true },
        { text: 'Status', bold: true },
        { text: 'Betrag', bold: true, alignment: 'right' },
        { text: 'Erstellt von', bold: true },
        { text: 'Storno', bold: true },
    ]];
    for (const bon of abschluss.bons) {
        bonRows.push([
            String(bon.number),
            formatDateTimeBerlin(bon.createdAt),
            paymentMethodLabels[bon.paymentMethod],
            bon.status === 'CANCELLED' ? 'Storniert' : 'Abgeschlossen',
            { text: formatEuro(bon.totalCents), alignment: 'right' },
            bon.createdByName,
            bon.status === 'CANCELLED'
                ? `${bon.cancelledByName ?? ''}${bon.cancelledAt ? `, ${formatDateTimeBerlin(bon.cancelledAt)}` : ''}${bon.cancelReason ? `: ${bon.cancelReason}` : ''}`
                : '',
        ]);
    }

    const shownFilms = summarizeShownFilms(abschluss);
    const shownFilmRows: TableCell[][] = [[
        { text: 'Film', bold: true },
        { text: 'Anzahl', bold: true, alignment: 'right' },
        { text: 'Vorführzeiten', bold: true },
    ]];
    for (const film of shownFilms) {
        shownFilmRows.push([
            film.title,
            { text: String(film.count), alignment: 'right' },
            film.startsAt.map(value => formatDateTimeBerlin(new Date(value))).join(', '),
        ]);
    }
    const shownFilmsContent: Content[] = shownFilms.length
        ? [
                { text: 'Gezeigte Filme', style: 'section' },
                {
                    table: { widths: ['*', 'auto', '*'], headerRows: 1, body: shownFilmRows },
                    layout: 'lightHorizontalLines',
                    margin: [0, 6, 0, 20],
                },
            ]
        : [];

    const numbered = abschlussNumbered(abschluss);
    const numberedRows: TableCell[][] = [[
        { text: 'Pool', bold: true },
        { text: 'Erste Nr.', bold: true, alignment: 'right' },
        { text: 'Letzte Nr. (erwartet)', bold: true, alignment: 'right' },
        { text: 'Letzte Nr. (gezählt)', bold: true, alignment: 'right' },
        { text: 'Stückzahl', bold: true, alignment: 'right' },
        { text: 'Grund', bold: true },
    ]];
    for (const entry of numbered) {
        numberedRows.push([
            entry.name,
            { text: String(entry.firstNumber), alignment: 'right' },
            { text: String(entry.lastNumber), alignment: 'right' },
            { text: String(entry.countedLastNumber), alignment: 'right', bold: entry.countedLastNumber !== entry.lastNumber },
            { text: String(entry.quantity), alignment: 'right' },
            entry.reason ?? '',
        ]);
    }
    const numberedContent: Content[] = numbered.length
        ? [
                { text: 'Nummernpools', style: 'section' },
                {
                    table: { widths: ['*', 'auto', 'auto', 'auto', 'auto', '*'], headerRows: 1, body: numberedRows },
                    layout: 'lightHorizontalLines',
                    margin: [0, 6, 0, 20],
                },
            ]
        : [];

    const content: Content = [
        { text: siteName, style: 'muted' },
        { text: `Tagesabschluss Nr. ${abschluss.number}`, style: 'title' },
        {
            table: {
                widths: ['auto', '*'],
                body: summaryRows(abschluss).map(row => [{ text: row.label, bold: true }, row.value]),
            },
            layout: 'lightHorizontalLines',
            margin: [0, 12, 0, 20],
        },
        { text: 'Verkaufte Artikel', style: 'section' },
        {
            table: { widths: ['auto', '*', 'auto', 'auto', 'auto'], headerRows: 1, body: itemRows },
            layout: 'lightHorizontalLines',
            margin: [0, 6, 0, 20],
        },
        ...numberedContent,
        ...shownFilmsContent,
        { text: 'Bons', style: 'section' },
        {
            table: { widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'], headerRows: 1, body: bonRows },
            layout: 'lightHorizontalLines',
            margin: [0, 6, 0, 0],
        },
    ];

    const docDefinition: TDocumentDefinitions = {
        content,
        defaultStyle: { font: 'Helvetica', fontSize: 9 },
        styles: {
            title: { fontSize: 18, bold: true },
            section: { fontSize: 12, bold: true },
            muted: { fontSize: 9, color: '#666666' },
        },
        pageMargins: [40, 40, 40, 50],
        footer: (currentPage, pageCount) => ({
            text: `${siteName} – Tagesabschluss Nr. ${abschluss.number} – Seite ${currentPage} von ${pageCount}`,
            alignment: 'center',
            fontSize: 8,
            color: '#666666',
            margin: [0, 16, 0, 0],
        }),
    };

    const document = printer.createPdfKitDocument(docDefinition);
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        document.on('data', (chunk: Buffer) => chunks.push(chunk));
        document.on('end', () => resolve(Buffer.concat(chunks)));
        document.on('error', reject);
        document.end();
    });
}
