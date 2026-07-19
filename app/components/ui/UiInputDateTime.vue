<template>
    <input
        v-model="model"
        type="datetime-local"
        class="ui-datetime"
        :required="required"
        :min="min"
        :max="max"
        :disabled="disabled"
    >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    required?: boolean;
    min?: string;
    max?: string;
    disabled?: boolean;
}>(), {
    required: false,
    min: undefined,
    max: undefined,
    disabled: false,
});

const model = defineModel<string>({ required: true });
</script>

<style scoped lang="scss">
.ui-datetime {
    width: 100%;
    min-height: 44px;
    padding: 0 0.75rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    color: $lightgray50;

    color-scheme: dark;
    background: $darkgray950;
    outline: none;

    &:focus-visible {
        border-color: $primary400;
        outline: 2px solid rgb(221 91 69 / 22%);
    }

    &:disabled {
        opacity: 0.45;
    }
}
</style>
