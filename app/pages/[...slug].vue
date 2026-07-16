<template>
    <ThemePageSwitcher :theme="pageTheme" :slug="slug">
        <block-renderer
            :blocks="blocks"
            :entries="programEntries"
            :program-pending="programStatus === 'pending'"
            :program-error="!!programError"
            @retry-program="refreshProgram()"
        />
        <section v-if="isAnfahrt" class="arrival-actions">
            <ui-shell size="info" class="arrival-actions_inner">
                <p class="arrival-actions_kicker">Direkt planen</p>
                <div class="arrival-actions_links">
                    <ui-button
                        href="https://maps.google.com/?q=August-Bebel-Stra%C3%9Fe+20,+01219+Dresden"
                        target="_blank"
                        rel="noopener noreferrer"
                        type="primary"
                    >
                        Route in Google Maps
                    </ui-button>
                    <ui-button
                        :href="arrivalPlannerUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        type="secondary"
                    >
                        DVB Fahrplanauskunft
                    </ui-button>
                </div>
            </ui-shell>
        </section>
    </ThemePageSwitcher>
</template>

<script setup lang="ts">
import { resolvePageTheme } from '~~/types/content';
import type { PageBlock, PageRecord, PageThemeChoice } from '~~/types/content';
import type { ProgramEntry } from '~~/types/program';
import ThemePageSwitcher from '~/components/theme/ThemePageSwitcher.vue';

definePageMeta({
    layout: 'default',
});

const route = useRoute();
const slug = computed(() => {
    const param = route.params.slug;
    return (Array.isArray(param) ? param.join('/') : param ?? '').replace(/^\/+|\/+$/g, '');
});

const isAnfahrt = computed(() => slug.value === 'anfahrt');
const arrivalPlannerUrl =
    'https://www.dvb.de/de-de/hl?id=2000poiID%3A2104107173%3A14612000%3A-1%3AKino%20im%20Kasten%3ADresden%3AKino%20im%20Kasten%3AANY%3APOI%3A1531015%3A5373156%3AMRCV%3AVVO';

const { data: pageData, error: pageError } = await useFetch<{ page: PageRecord }>('/api/page', {
    query: { slug },
    key: () => `page-${slug.value}`,
});

if (pageError.value || !pageData.value?.page) {
    throw createError({
        statusCode: pageError.value?.statusCode ?? 404,
        statusMessage: 'Seite nicht gefunden',
        fatal: true,
    });
}

const page = computed(() => pageData.value!.page);
const pageTheme = computed<PageThemeChoice>(() => {
    const resolved = resolvePageTheme(page.value.theme);
    if (slug.value === 'anfahrt' && resolved === 'default') return 'das-kino';
    return resolved;
});
const blocks = computed<PageBlock[]>(() => Array.isArray(page.value.blocks) ? page.value.blocks : []);

const programNeed = computed(() => blocks.value.reduce((need, block) => {
    if (block.type === 'landingHero' && block.showNextScreening) return Math.max(need, 1);
    if (block.type === 'programOverview' && block.venueFilter) return 100;
    if (block.type === 'programOverview') return Math.max(need, block.offset + block.limit);
    return need;
}, 0));

const {
    data: programData,
    status: programStatus,
    error: programError,
    refresh: refreshProgram,
} = await useAsyncData(
    () => `page-program-${slug.value}`,
    async () => programNeed.value === 0
        ? { entries: [] as ProgramEntry[] }
        : await $fetch<{ entries: ProgramEntry[] }>('/api/program', { query: { limit: programNeed.value } }),
    { watch: [programNeed] },
);

const programEntries = computed(() => programData.value?.entries ?? []);

useHead(() => ({
    title: page.value.title,
    meta: page.value.description
        ? [{ name: 'description', content: page.value.description }]
        : [],
}));
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.arrival-actions {
    margin-top: 26px;

    &_inner {
        display: flex;
        flex-wrap: wrap;
        gap: 14px 18px;
        align-items: center;
        justify-content: space-between;

        padding: 18px 22px;
        border: 1px solid rgb(112 57 44 / 65%);
        border-radius: 8px;

        background:
            radial-gradient(circle at 92% 12%, rgb(255 223 160 / 11%) 0%, transparent 42%),
            linear-gradient(180deg, rgb(31 16 15 / 95%) 0%, rgb(24 14 14 / 95%) 100%);
    }

    &_kicker {
        margin: 0;

        font-size: 11px;
        font-weight: 700;
        color: rgb(232 203 146 / 95%);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &_links {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    @include mobileOnly {
        margin-top: 20px;

        &_inner {
            gap: 12px;
            padding: 14px;
        }

        &_links {
            width: 100%;

            :deep(.button) {
                width: 100%;
            }
        }
    }
}

</style>
