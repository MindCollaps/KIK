import { SITE_NAME } from '~/utils/seo';

export interface PageSeoOptions {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    type?: 'website' | 'article';
    noindex?: boolean;
}

/**
 * Sets title, description, canonical link and Open Graph/Twitter tags for the
 * current route. The `content` key of og:url/canonical is always derived from
 * `siteUrl` (never the request host), so previews/staging deployments never
 * get canonicalized to themselves.
 */
export function usePageSeo(getOptions: () => PageSeoOptions) {
    const config = useRuntimeConfig();
    const route = useRoute();

    useHead(() => {
        const options = getOptions();
        const siteUrl = config.public.siteUrl.replace(/\/+$/, '');
        const canonicalPath = route.path === '/' ? '' : route.path.replace(/\/+$/, '');
        const canonicalUrl = `${ siteUrl }${ canonicalPath }`;
        const ogTitle = options.title || SITE_NAME;
        const image = !options.image
            ? undefined
            : options.image.startsWith('http')
                ? options.image
                : `${ siteUrl }${ options.image }`;

        return {
            title: options.title ?? undefined,
            meta: [
                { key: 'og:title', property: 'og:title', content: ogTitle },
                { key: 'og:type', property: 'og:type', content: options.type ?? 'website' },
                { key: 'og:url', property: 'og:url', content: canonicalUrl },
                { key: 'twitter:card', name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
                ...(options.description
                    ? [
                        { key: 'description', name: 'description', content: options.description },
                        { key: 'og:description', property: 'og:description', content: options.description },
                    ]
                    : []),
                ...(image ? [{ key: 'og:image', property: 'og:image', content: image }] : []),
                ...(options.noindex ? [{ key: 'robots', name: 'robots', content: 'noindex, nofollow' }] : []),
            ],
            link: [
                { key: 'canonical', rel: 'canonical', href: canonicalUrl },
            ],
        };
    });
}
