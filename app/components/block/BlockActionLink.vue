<template>
    <ui-button
        v-if="isInternal"
        :to="action.to"
        :type="action.style"
    >
        {{ action.label }}
    </ui-button>
    <ui-button
        v-else
        :href="action.to"
        :target="isExternal ? '_blank' : undefined"
        :rel="isExternal ? 'noopener noreferrer' : undefined"
        :type="action.style"
    >
        {{ action.label }}
    </ui-button>
</template>

<script setup lang="ts">
import type { BlockAction } from '~~/types/content';

const props = defineProps<{
    action: BlockAction;
}>();

const isInternal = computed(() => props.action.to.startsWith('/'));
const isExternal = computed(() => /^https?:\/\//.test(props.action.to));
</script>
