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
.content-page--theme-glow {
    background:
        linear-gradient(180deg, rgb(15 12 10) 0%, rgb(22 18 16) 28%, rgb(15 12 10) 100%);

    &::before {
        background:
            radial-gradient(circle at 92% 88%, rgb(215 172 92 / 34%) 0%, rgb(215 172 92 / 0%) 44%),
            radial-gradient(circle at 10% 6%, rgb(196 48 31 / 26%) 0%, rgb(196 48 31 / 0%) 38%);
    }

    &::after {
        background:
            radial-gradient(circle at 80% 100%, rgb(215 172 92 / 18%) 0%, transparent 40%);
    }
}
</style>
