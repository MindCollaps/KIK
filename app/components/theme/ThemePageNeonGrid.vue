<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-neon-grid">
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

.content-page--theme-neon-grid {
    background:
        linear-gradient(180deg, $darkgray1000Orig 0%, $darkgray950Orig 50%, $darkgray1000Orig 100%);

    &::before {
        background:
            linear-gradient(transparent 0%, rgba($darkgray1000Orig, 0.82) 55%, $darkgray1000Orig 100%),
            repeating-linear-gradient(
                90deg,
                rgba($secondary600Orig, 0.16) 0,
                rgba($secondary600Orig, 0.16) 1px,
                transparent 1px,
                transparent 80px
            ),
            repeating-linear-gradient(
                180deg,
                rgba($secondary600Orig, 0.12) 0,
                rgba($secondary600Orig, 0.12) 1px,
                transparent 1px,
                transparent 80px
            );
    }

    &::after {
        background:
            radial-gradient(circle at 15% 24%, rgba($primary500Orig, 0.16) 0%, transparent 32%),
            radial-gradient(circle at 82% 82%, rgba($secondary400Orig, 0.16) 0%, transparent 30%);
    }
}
</style>
