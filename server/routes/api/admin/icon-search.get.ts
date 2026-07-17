import materialSymbols from '@iconify-json/material-symbols/icons.json';
import mdi from '@iconify-json/mdi/icons.json';
import { requireAdmin } from '../../../utils/auth';

const iconSets = [
    { prefix: 'material-symbols', names: Object.keys(materialSymbols.icons) },
    { prefix: 'mdi', names: Object.keys(mdi.icons) },
];

export default defineEventHandler(async event => {
    await requireAdmin(event);

    const { q } = getQuery(event);
    const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

    if (!query) return [];

    return iconSets.flatMap(({ prefix, names }) => names
        .filter(name => name.includes(query))
        .slice(0, 64)
        .map(name => `${prefix}:${name}`));
});
