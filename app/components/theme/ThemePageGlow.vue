<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-glow">
        <slot />
    </ThemePageBase>
</template>

<script setup lang="ts">
import ThemePageBase from './ThemePageBase.vue';

defineProps<{
    slug: string;
}>();
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.content-page--theme-glow {
    background:
        linear-gradient(180deg, $darkgray1000Orig 0%, $darkgray950Orig 28%, $darkgray1000Orig 100%);

    &::before {
        background:
            radial-gradient(circle at 100% 88%, rgba($secondary400Orig, 0.15) 0%, rgba($secondary300Orig, 0) 50%),
            radial-gradient(circle at 10% 0%, rgba($primary500Orig, 0.31) 0%, rgba($primary500Orig, 0) 43%);
    }

    &::after {
        background:
            radial-gradient(circle at 80% 100%, rgba($secondary400Orig, 0.18) 0%, transparent 40%);
    }
}
</style>
