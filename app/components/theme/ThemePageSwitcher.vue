<template>
    <component :is="themeComponent" :slug="slug">
        <slot />
    </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { PageThemeChoice } from '~~/types/content';

import ThemePageDasKino from './ThemePageDasKino.vue';
import ThemePageDefault from './ThemePageDefault.vue';
import ThemePageGlow from './ThemePageGlow.vue';
import ThemePageNeonGrid from './ThemePageNeonGrid.vue';
import ThemePageProgramm from './ThemePageProgramm.vue';
import ThemePageSommerkino from './ThemePageSommerkino.vue';

const props = defineProps<{
    theme: PageThemeChoice;
    slug: string;
}>();

const themeMap: Record<PageThemeChoice, Component> = {
    default: ThemePageDefault,
    sommerkino: ThemePageSommerkino,
    'das-kino': ThemePageDasKino,
    glow: ThemePageGlow,
    'neon-grid': ThemePageNeonGrid,
    programm: ThemePageProgramm,
};

const themeComponent = computed(() => themeMap[props.theme] ?? ThemePageDefault);
</script>
