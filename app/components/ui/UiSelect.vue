<template>
    <div class="ui-select" :class="{ 'ui-select--disabled': disabled }">
        <select
            v-model="model"
            :disabled="disabled"
            :required="required"
            :aria-label="ariaLabel"
            @change="$emit('change', $event)"
        >
            <slot/>
        </select>
        <Icon name="material-symbols:expand-more-rounded" class="ui-select_chevron" aria-hidden="true" />
    </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

withDefaults(defineProps<{
    disabled?: boolean;
    required?: boolean;
    ariaLabel?: string;
}>(), {
    disabled: false,
    required: false,
    ariaLabel: undefined,
});

defineEmits<{ change: [event: Event] }>();

defineSlots<{ default: () => VNode[] }>();

const model = defineModel<string>({ required: true });
</script>

<style scoped lang="scss">
.ui-select {
    position: relative;
    display: inline-flex;

    &--disabled {
        opacity: 0.55;
    }

    select {
        flex: 1;

        min-height: 42px;
        padding: 0 2rem 0 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        appearance: none;
        color-scheme: dark;
        background: $darkgray950;
        outline: none;

        &:disabled {
            cursor: not-allowed;
        }

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    &_chevron {
        pointer-events: none;

        position: absolute;
        top: 50%;
        right: 0.6rem;
        transform: translateY(-50%);

        width: 1.05rem;
        height: 1.05rem;

        color: $lightgray300;
    }
}
</style>
