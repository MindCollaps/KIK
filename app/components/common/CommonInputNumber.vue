<template>
    <ui-input-text
        v-model="inputValue"
        v-model:focused="focused"
        :height
        :input-attrs
        input-type="number"
        :placeholder
        @change="$emit('change', $event)"
        @input="$emit('input', $event)"
    >
        <slot/>
        <template
            v-if="$slots.icon"
            #icon
        >
            <slot name="icon"/>
        </template>
    </ui-input-text>
</template>

<script setup lang="ts">
import type { PropType, VNode } from 'vue';

defineProps({
    inputAttrs: {
        type: Object as PropType<Record<string, unknown>>,
        default: () => {},
    },
    height: {
        type: String,
        default: null,
    },
    placeholder: {
        type: String,
        default: null,
    },
});

defineEmits({
    input: (_event: Event) => true,
    change: (_event: Event) => true,
});

defineSlots<{ default?: () => string; icon?: () => VNode[] }>();

const focused = defineModel('focused', { type: Boolean });
const model = defineModel({ type: Number as PropType<null | number>, default: null });

const inputValue = computed({
    get: () => model.value === null ? '' : String(model.value),
    set: (value: string) => {
        model.value = value === '' ? null : Number(value);
    },
});
</script>
