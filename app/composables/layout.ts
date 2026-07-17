import { useStore } from '~/store/index';
import { radarColors, radarThemes } from '#build/radar/colors';
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME } from '~/utils/seo';

const store = useStore();

export const ready = computed(() => {
    return store.ready;
});

export const useLayout = () => {
    // Theme handling
    const themeCookie = useCookie<ThemesList>('theme', {
        path: '/',
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 360,
    });

    // Reactive theme reference
    store.theme = themeCookie.value ?? 'default';

    useHead(() => {
        const theme = store.theme ?? 'default';
        const themeColors = theme === 'default'
            ? {}
            : ((radarThemes as Record<string, Record<string, unknown>>)[theme] ?? {});
        const css = Object
            .entries({
                ...radarColors,
                ...themeColors,
            })
            .filter(([key]) => key.endsWith('Rgb'))
            .map(([key, value]) => `--${ key.replace('Rgb', '') }: ${ (value as number[]).join(',') }`)
            .join(';');

        return {
            titleTemplate(title) {
                if (!title) return SITE_NAME;
                return `${ title } | ${ SITE_NAME }`;
            },
            meta: [
                {
                    key: 'description',
                    name: 'description',
                    content: SITE_DEFAULT_DESCRIPTION,
                },
                {
                    key: 'og:site_name',
                    property: 'og:site_name',
                    content: SITE_NAME,
                },
                {
                    key: 'og:locale',
                    property: 'og:locale',
                    content: 'de_DE',
                },
            ],
            htmlAttrs: {
                lang: 'de',
                class: [`theme-${ store.theme ?? 'light' }`],
            },
            style: [{
                key: 'pageStyles',
                innerHTML: `:root {${ css }}`,
            }],
        };
    });

    onNuxtReady(() => {
        setWindowStore();
        window.addEventListener('resize', setWindowStore);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', setWindowStore);
    });
};


function setWindowStore() {
    store.isMobile = window.innerWidth < 700;
    store.isMobileOrTablet = window.innerWidth < 1466;
    store.isTablet = window.innerWidth < 1466 && window.innerWidth >= 700;
    store.isPC = window.innerWidth >= 1466;
    store.isPCWide = window.innerWidth >= 1900;
    store.scrollbarWidth = window.innerWidth - document.documentElement.offsetWidth;
    store.viewport.width = window.innerWidth;
}
