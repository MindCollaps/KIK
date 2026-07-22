<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-das-kino">
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

.content-page--theme-das-kino {
    background:
        linear-gradient(180deg, rgb(20 11 12) 0%, rgb(34 13 13) 36%, rgb(16 11 12) 100%);

    &::before {
        opacity: 0.9;
        background:
            radial-gradient(circle at 50% -12%, rgba($primary500Orig, 0.28) 0%, transparent 42%),
            repeating-linear-gradient(
                90deg,
                rgb(58 21 22 / 32%) 0,
                rgb(58 21 22 / 32%) 3px,
                rgb(42 15 17 / 0%) 3px,
                rgb(42 15 17 / 0%) 22px
            );
    }

    &::after {
        background:
            radial-gradient(circle at 50% 8%, rgb(255 223 160 / 12%) 0%, transparent 48%);
    }
}
</style>
