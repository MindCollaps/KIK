<template>
    <div
        class="checkbox"
        :class="{ 'checkbox--checked': checked, 'checkbox--revert': revert, 'checkbox--disabled': disabled }"
        role="checkbox"
        :aria-checked="checked"
        :aria-disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        @click="toggle"
        @keydown.enter.space.prevent="toggle"
    >
        <div class="checkbox_icon">
            <Icon
                v-if="checked"
                name="material-symbols:check-rounded"
            />
        </div>
        <div class="checkbox_text">
            <slot/>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';

const props = defineProps({
    revert: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

defineSlots<{ default: () => VNode[] }>();

const checked = defineModel({ type: Boolean, required: true });

function toggle() {
    if (props.disabled) return;
    checked.value = !checked.value;
}
</script>

<style scoped lang="scss">
.checkbox {
    cursor: pointer;
    user-select: none;

    display: flex;
    gap: 16px;
    align-items: center;

    font-family: $defaultFont;
    font-size: 12px;
    font-weight: 600;
    line-height: 100%;

    &--revert {
        flex-direction: row-reverse;
    }

    &--disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    &_icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 16px;
        height: 16px;
        border: 1px solid $lightgray100;
        border-radius: 4px;

        transition: 0.3s;

        svg {
            transform: scale(0);
            width: 10px;
            transition: 0.3s;
        }
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }

    &--checked .checkbox {
        &_icon {
            border-color: $primary500;
            background: $primary500;

            svg {
                transform: scale(1);
                color: $lightgray150Orig;
            }
        }
    }
}
</style>
