<template>
    <ThemePageBase :slug="slug" theme-class="content-page--theme-default" :effects-disabled="true">
        <slot />
    </ThemePageBase>
</template>

<script setup lang="ts">
import ThemePageBase from './ThemePageBase.vue';

defineProps<{
    slug: string;
}>();
</script>
