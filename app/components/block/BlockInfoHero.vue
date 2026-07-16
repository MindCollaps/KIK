<template>
    <common-info-hero
        :eyebrow="block.eyebrow"
        :title="block.title"
        :description="block.description ?? undefined"
    >
        <div v-if="block.actions.length" class="block-info-hero_actions">
            <block-action-link
                v-for="(action, index) in block.actions"
                :key="index"
                :action="action"
            />
        </div>
    </common-info-hero>
</template>

<script setup lang="ts">
import type { InfoHeroBlock } from '~~/types/content';

defineProps<{
    block: InfoHeroBlock;
}>();
</script>

<style scoped lang="scss">
.block-info-hero_actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 24px;
}

@include mobileOnly {
    .block-info-hero_actions {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
