<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-sommerkino">
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
.content-page--theme-sommerkino {
    background:
        linear-gradient(180deg, rgb(6 10 22) 0%, rgb(6 17 34) 36%, rgb(9 25 39) 100%);

    &::before {
        background:
            radial-gradient(circle at 88% 18%, rgb(112 221 203 / 22%) 0%, transparent 38%),
            radial-gradient(circle at 14% 80%, rgb(97 141 255 / 20%) 0%, transparent 44%),
            linear-gradient(180deg, rgb(8 10 24 / 78%) 0%, rgb(6 11 23 / 62%) 100%);
    }

    &::after {
        background:
            radial-gradient(ellipse at 50% 104%, rgb(255 199 106 / 14%) 0%, transparent 45%);
    }
}

.content-page--theme-sommerkino .common-info-hero_title,
.content-page--theme-sommerkino .common-landing-hero_title {
    text-shadow: 0 0 22px rgb(112 221 203 / 26%);
}
</style>
