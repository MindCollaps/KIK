<template>
    <section class="common-info-hero">
        <ui-shell size="info">
            <ui-eyebrow>{{ eyebrow }}</ui-eyebrow>
            <ui-section-title size="hero" tag="h1" class="common-info-hero_title">{{ title }}</ui-section-title>
            <p v-if="description" class="common-info-hero_description">{{ description }}</p>
            <slot />
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

defineProps<{
    eyebrow: string;
    title: string;
    description?: string;
}>();

defineSlots<{
    default?: () => VNode[];
}>();
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.common-info-hero {
    padding: 32px 0 12px;

    &_title {
        margin-top: 8px;
    }

    &_description {
        max-width: 65ch;
        margin-top: 14px;

        font-size: 15px;
        line-height: 1.75;
        color: $lightgray200;
    }

    @include mobileOnly {
        padding-top: 20px;
    }
}
</style>
