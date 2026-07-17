<template>
    <div class="common-page">
        <h1>{{ title }}</h1>
        <slot/>
    </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

defineProps<{
    title: string;
}>();

defineSlots<{
    default: () => VNode[];
}>();
</script>

<style scoped lang="scss">
.common-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;

    padding: 32px;

    h1 {
        font-family: $displayFont;
        font-size: 44px;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 0.02em;

        @include mobile {
            font-size: 34px;
        }
    }

    p {
        font-size: 14px;

        @include mobile {
            font-size: 12px;
        }
    }
}
</style>
