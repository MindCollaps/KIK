<template>
    <div class="app_content">
        <nuxt-loading-indicator :color="colorsList.primary300"/>
        <slot/>
        <common-toast-container/>
    </div>
</template>

<script setup lang="ts">
import { colorsList } from '#imports';
import type { VNode } from 'vue';

defineSlots<{ default: () => VNode[] }>();

useLayout();
</script>

<style lang="scss">
@use "~/scss/layout";
</style>
