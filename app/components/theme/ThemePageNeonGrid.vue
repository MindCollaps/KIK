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
.content-page--theme-neon-grid {
    background:
        linear-gradient(180deg, rgb(5 8 18) 0%, rgb(4 7 16) 100%);

    &::before {
        background:
            linear-gradient(transparent 0%, rgb(4 7 16 / 82%) 55%, rgb(4 7 16) 100%),
            repeating-linear-gradient(
                90deg,
                rgb(81 110 255 / 16%) 0,
                rgb(81 110 255 / 16%) 1px,
                transparent 1px,
                transparent 80px
            ),
            repeating-linear-gradient(
                180deg,
                rgb(81 110 255 / 12%) 0,
                rgb(81 110 255 / 12%) 1px,
                transparent 1px,
                transparent 80px
            );
    }

    &::after {
        background:
            radial-gradient(circle at 15% 24%, rgb(250 82 120 / 14%) 0%, transparent 32%),
            radial-gradient(circle at 82% 82%, rgb(88 210 255 / 14%) 0%, transparent 30%);
    }
}

.content-page--theme-neon-grid .ui-shell,
.content-page--theme-neon-grid .common-info-section,
.content-page--theme-neon-grid .common-info-hero,
.content-page--theme-neon-grid .common-landing-panel {
    backdrop-filter: blur(2px);
}
</style>
