<template>
    <section class="common-landing-hero">
        <ui-shell size="wide">
            <ui-eyebrow>{{ eyebrow }}</ui-eyebrow>
            <ui-section-title size="hero" class="common-landing-hero_title">{{ title }}</ui-section-title>
            <p class="common-landing-hero_description">{{ description }}</p>
            <div class="common-landing-hero_actions">
                <slot name="actions" />
            </div>
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

defineProps<{
    eyebrow: string;
    title: string;
    description: string;
}>();

defineSlots<{
    actions?: () => VNode[];
}>();
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.common-landing-hero {
    min-height: min(62dvh, 640px);
    padding-top: 44px;

    &_title {
        margin-top: 4px;
        font-size: clamp(54px, 10vw, 120px);
        line-height: 0.9;
    }

    &_description {
        max-width: 64ch;
        margin: 14px 0 0;
        line-height: 1.7;
        color: $lightgray200;
    }

    &_actions {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 24px;
    }

    @include mobile {
        min-height: auto;
        padding-top: 24px;

        &_actions {
            flex-wrap: wrap;
        }
    }
}
</style>
