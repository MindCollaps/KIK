export const SITE_NAME = 'Kino im Kasten';
export const SITE_DEFAULT_DESCRIPTION = 'Kino im Kasten – das studentische Programmkino der TU Dresden. Filme für alle, drinnen wie im Sommerkino.';

export function truncateForMeta(text: string, maxLength = 155) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    const cut = clean.slice(0, maxLength - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return `${ lastSpace > 40 ? cut.slice(0, lastSpace) : cut }…`;
}
