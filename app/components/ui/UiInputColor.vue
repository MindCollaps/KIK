<template>
    <div class="ui-color" :class="{ 'ui-color--disabled': disabled }">
        <input
            type="color"
            class="ui-color_input"
            :value="model || fallback"
            :disabled="disabled"
            @input="onInput"
        >
        <button v-if="clearable && model" type="button" class="ui-color_clear" @click="model = ''">
            Entfernen
        </button>
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    fallback?: string;
    clearable?: boolean;
    disabled?: boolean;
}>(), {
    fallback: '#2b2420',
    clearable: false,
    disabled: false,
});

const model = defineModel<string>({ required: true });

function onInput(event: Event) {
    model.value = (event.target as HTMLInputElement).value;
}
</script>

<style scoped lang="scss">
.ui-color {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;

    &--disabled {
        opacity: 0.55;
    }

    &_input {
        cursor: pointer;

        width: 40px;
        height: 34px;
        padding: 0.15rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        background: $darkgray950;

        &:disabled {
            cursor: not-allowed;
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }

    &_clear {
        cursor: pointer;

        padding: 0.2rem 0.4rem;
        border: 0;

        font: inherit;
        font-size: 0.7rem;
        color: $lightgray400;
        text-decoration: underline;

        background: transparent;

        &:focus-visible {
            outline: 2px solid $primary400;
        }
    }
}
</style>
