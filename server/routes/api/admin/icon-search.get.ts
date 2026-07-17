import icons from '@iconify-json/material-symbols/icons.json';
import { requireAdmin } from '../../../utils/auth';

const allNames = Object.keys(icons.icons);

export default defineEventHandler(async event => {
    await requireAdmin(event);

    const { q } = getQuery(event);
    const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

    if (!query) return [];

    return allNames
        .filter(name => name.includes(query))
        .slice(0, 64)
        .map(name => `material-symbols:${name}`);
});
