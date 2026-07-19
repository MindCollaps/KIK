<template>
    <div class="ui-search" :class="{ 'ui-search--focused': focused, 'ui-search--disabled': disabled }">
        <Icon name="material-symbols:search-rounded" aria-hidden="true" />
        <input
            ref="inputRef"
            v-model.trim="model"
            type="search"
            :placeholder="placeholder"
            :aria-label="ariaLabel"
            :minlength="minlength"
            :maxlength="maxlength"
            :disabled="disabled"
            autocomplete="off"
            @focus="focused = true"
            @blur="focused = false"
            @keydown.enter.prevent="$emit('search')"
        >
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    placeholder?: string;
    ariaLabel?: string;
    minlength?: number;
    maxlength?: number;
    disabled?: boolean;
}>(), {
    placeholder: undefined,
    ariaLabel: undefined,
    minlength: undefined,
    maxlength: undefined,
    disabled: false,
});

defineEmits<{ search: [] }>();

const model = defineModel<string>({ required: true });
const focused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

defineExpose({ input: inputRef });
</script>

<style scoped lang="scss">
.ui-search {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    min-height: 44px;
    padding: 0 0.75rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    background: $darkgray950;

    svg {
        flex-shrink: 0;
        width: 1.05rem;
        height: 1.05rem;
        color: $lightgray400;
    }

    input {
        flex: 1;

        min-width: 0;
        border: 0;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        background: transparent;
        outline: none;

        &::placeholder {
            color: $lightgray400;
        }
    }

    &--focused {
        border-color: $primary400;
        outline: 2px solid rgb(221 91 69 / 22%);
    }

    &--disabled {
        opacity: 0.55;
    }
}
</style>
