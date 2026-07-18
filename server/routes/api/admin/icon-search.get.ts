import materialSymbols from '@iconify-json/material-symbols/icons.json';
import mdi from '@iconify-json/mdi/icons.json';
import { requireAuthAny } from '../../../utils/auth';
import { Permission } from '~~/types/permissions';

const iconSets = [
    { prefix: 'material-symbols', names: Object.keys(materialSymbols.icons) },
    { prefix: 'mdi', names: Object.keys(mdi.icons) },
];

export default defineEventHandler(async event => {
    await requireAuthAny(event, Permission.Pages, Permission.Program, Permission.Settings);

    const { q } = getQuery(event);
    const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

    if (!query) return [];

    return iconSets.flatMap(({ prefix, names }) => names
        .filter(name => name.includes(query))
        .slice(0, 64)
        .map(name => `${prefix}:${name}`));
});
