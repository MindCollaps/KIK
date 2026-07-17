<template>
    <component :is="tag" class="ui-section-title" :class="`ui-section-title--${size}`">
        <slot />
    </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    tag?: string;
    size?: 'hero' | 'section';
}>(), {
    tag: 'h2',
    size: 'section',
});
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.ui-section-title {
    margin: 0;

    font-family: $displayFont;
    font-weight: 400;
    hyphens: auto;
    text-transform: uppercase;
    text-wrap: balance;
    letter-spacing: 0.02em;
    overflow-wrap: anywhere;

    &--hero {
        font-size: clamp(46px, 8vw, 90px);
        line-height: 0.95;
    }

    &--section {
        font-size: clamp(1.9rem, 5.5vw, 2.8rem);
        line-height: 1;
    }
}
</style>
