import { prisma } from '../../utils/prisma';

export default defineEventHandler(async event => {
    const query = getQuery(event);
    const slug = typeof query.slug === 'string' ? query.slug.replace(/^\/+|\/+$/g, '') : '';

    const page = await prisma.page.findFirst({
        where: { slug, status: 'PUBLISHED' },
    });

    if (!page) {
        throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden.' });
    }

    return { page };
});
