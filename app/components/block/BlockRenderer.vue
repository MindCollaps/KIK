<template>
    <template v-for="block in blocks" :key="block.id">
        <block-landing-hero
            v-if="block.type === 'landingHero'"
            :block="block"
            :entries="entries"
            :program-pending="programPending"
            :program-error="programError"
            @retry="$emit('retryProgram')"
        />
        <block-program-overview
            v-else-if="block.type === 'programOverview'"
            :block="block"
            :entries="entries"
        />
        <block-info-hero v-else-if="block.type === 'infoHero'" :block="block" />
        <block-markdown v-else-if="block.type === 'markdown'" :block="block" />
        <block-card-grid v-else-if="block.type === 'cardGrid'" :block="block" />
        <block-image v-else-if="block.type === 'image'" :block="block" />
        <block-split v-else-if="block.type === 'split'" :block="block" />
        <block-network v-else-if="block.type === 'network'" :block="block" />
    </template>
</template>

<script setup lang="ts">
import type { PageBlock } from '~~/types/content';
import type { ProgramEntry } from '~~/types/program';

withDefaults(defineProps<{
    blocks: PageBlock[];
    entries?: ProgramEntry[];
    programPending?: boolean;
    programError?: boolean;
}>(), {
    entries: () => [],
    programPending: false,
    programError: false,
});

defineEmits<{
    retryProgram: [];
}>();
</script>
