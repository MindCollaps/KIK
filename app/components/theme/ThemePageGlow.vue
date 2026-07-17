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
            radial-gradient(circle at 92% 88%, rgba($secondary400Orig, 0.34) 0%, rgba($secondary400Orig, 0) 44%),
            radial-gradient(circle at 10% 6%, rgba($primary500Orig, 0.26) 0%, rgba($primary500Orig, 0) 38%);
    }

    &::after {
        background:
            radial-gradient(circle at 80% 100%, rgba($secondary400Orig, 0.18) 0%, transparent 40%);
    }
}
</style>
