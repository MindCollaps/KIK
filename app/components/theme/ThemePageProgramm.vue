<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-programm">
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

.content-page--theme-programm {
    background:
        linear-gradient(180deg, $darkgray1000Orig 0%, $darkgray950Orig 52%, $darkgray1000Orig 100%);

    &::before {
        background:
            radial-gradient(circle at 82% 10%, rgb(200 77 54 / 20%) 0%, transparent 40%),
            radial-gradient(circle at 6% 88%, rgba($secondary400Orig, 0.18) 0%, transparent 34%),
            repeating-linear-gradient(
                90deg,
                rgb(65 50 34 / 16%) 0,
                rgb(65 50 34 / 16%) 2px,
                transparent 2px,
                transparent 36px
            );
    }

    &::after {
        background:
            radial-gradient(circle at 50% 102%, rgb(210 121 77 / 16%) 0%, transparent 50%);
    }
}

.content-page--theme-programm .program-message,
.content-page--theme-programm .program-skeleton,
.content-page--theme-programm .program-card {
    border-color: rgba($darkgray700Orig, 0.82);
    background-color: rgba($darkgray1000Orig, 0.82);
}
</style>
