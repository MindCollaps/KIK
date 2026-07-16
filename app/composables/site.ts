import type { FooterConfig, NavigationConfig } from '~~/types/content';
import { defaultFooter, defaultNavigation } from '~~/server/utils/default-content';

export interface SiteConfig {
    navigation: NavigationConfig;
    footer: FooterConfig;
}

export function useSiteConfigState() {
    return useState<SiteConfig>('site-config', () => ({
        navigation: defaultNavigation,
        footer: defaultFooter,
    }));
}

export async function loadSiteConfig() {
    const state = useSiteConfigState();
    try {
        state.value = await $fetch<SiteConfig>('/api/site');
    }
    catch {
        // Fallback-Konfiguration behalten, wenn die API nicht erreichbar ist.
    }
    return state;
}
