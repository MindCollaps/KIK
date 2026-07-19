<template>
    <label class="ui-file" :class="[`ui-file--${variant}`, { 'ui-file--disabled': disabled }]">
        <slot/>
        <input
            type="file"
            class="ui-file_input"
            :accept="accept"
            :disabled="disabled"
            @change="onChange"
        >
    </label>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

withDefaults(defineProps<{
    accept?: string;
    disabled?: boolean;
    variant?: 'upload' | 'ghost';
}>(), {
    accept: undefined,
    disabled: false,
    variant: 'upload',
});

const emit = defineEmits<{ select: [file: File] }>();

defineSlots<{ default: () => VNode[] }>();

function onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Zurücksetzen, damit dieselbe Datei erneut ausgewählt werden kann
    input.value = '';
    if (file) emit('select', file);
}
</script>

<style scoped lang="scss">
.ui-file {
    cursor: pointer;
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;

    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    &_input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
    }

    &:focus-within {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }
}

.ui-file--upload {
    min-height: 44px;
    padding: 0 1rem;
    border: 1px dashed $darkgray600;
    border-radius: 8px;

    color: $lightgray100;

    :deep(svg) {
        width: 1.2rem;
        height: 1.2rem;
        color: $secondary300;
    }
}

.ui-file--ghost {
    min-height: 36px;
    padding: 0 0.7rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font-size: 0.8rem;
    color: $lightgray150;

    &:hover {
        border-color: $secondary600;
    }

    :deep(svg) {
        width: 1.05rem;
        height: 1.05rem;
        color: $secondary300;
    }
}
</style>
