<template>
    <label
        class="ui-radio"
        :class="[`ui-radio--${variant}`, { 'ui-radio--disabled': disabled }]"
    >
        <input
            type="radio"
            class="ui-radio_input"
            :name="name"
            :value="value"
            :checked="isChecked"
            :disabled="disabled"
            @change="model = value"
        >
        <span class="ui-radio_body">
            <Icon v-if="icon" :name="icon" class="ui-radio_icon" aria-hidden="true" />
            <span class="ui-radio_text">
                <span class="ui-radio_label"><slot/></span>
                <small v-if="$slots.description"><slot name="description"/></small>
            </span>
        </span>
    </label>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

const props = withDefaults(defineProps<{
    value: string;
    name?: string;
    disabled?: boolean;
    icon?: string;
    variant?: 'pill' | 'card';
}>(), {
    name: undefined,
    disabled: false,
    icon: undefined,
    variant: 'pill',
});

defineSlots<{ default: () => VNode[]; description?: () => VNode[] }>();

const model = defineModel<string>({ required: true });

const isChecked = computed(() => model.value === props.value);
</script>

<style scoped lang="scss">
.ui-radio {
    cursor: pointer;

    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    &_input {
        position: absolute;
        opacity: 0;
    }
}

.ui-radio--pill {
    .ui-radio_body {
        display: inline-flex;
        align-items: center;

        min-height: 44px;
        padding: 0 1rem;
        border: 1px solid $darkgray700;
        border-radius: 999px;

        color: $lightgray200;
    }

    .ui-radio_input:checked + .ui-radio_body {
        border-color: $secondary500;
        color: $secondary300;
        background: rgb(192 143 46 / 10%);
    }

    .ui-radio_input:focus-visible + .ui-radio_body {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }
}

.ui-radio--card {
    .ui-radio_body {
        display: grid;
        grid-template-columns: 1.5rem 1fr;
        gap: 0.2rem 0.65rem;

        min-height: 78px;
        padding: 0.8rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        color: $lightgray200;
    }

    .ui-radio_icon {
        grid-row: span 2;
        width: 1.3rem;
        height: 1.3rem;
    }

    .ui-radio_text {
        display: contents;
    }

    .ui-radio_label {
        font-weight: 700;
    }

    small {
        color: $lightgray300;
    }

    .ui-radio_input:checked + .ui-radio_body {
        border-color: $secondary500;
        color: $secondary300;
        background: rgb(192 143 46 / 8%);
    }

    .ui-radio_input:focus-visible + .ui-radio_body {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }
}
</style>
