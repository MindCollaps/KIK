<template>
    <component :is="tag" class="ui-shell" :class="`ui-shell--${size}`">
        <slot />
    </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    tag?: string;
    size?: 'info' | 'wide';
}>(), {
    tag: 'div',
    size: 'info',
});
</script>

<style scoped lang="scss">
.ui-shell {
    width: min(1100px, calc(100% - 48px));
    margin: 0 auto;

    &--wide {
        width: min(1200px, calc(100% - 48px));
    }

    @media all and (max-width: 699px) {
        width: calc(100% - 28px);

        &--wide {
            width: calc(100% - 30px);
        }
    }
}
</style>
