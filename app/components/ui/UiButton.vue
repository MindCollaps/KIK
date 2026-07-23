<template>
    <component
        :is="getTag"
        class="button"
        :class="[
            `button--type-${ type }`,
            `button--size-${ size }`,
            `button--orientation-${ orientation }`,
            {
                'button--active': active,
                'button--disabled': disabled,
                'button--icon': (!!$slots.icon || !!icon) && !$slots.default,
            },
        ]"
        :style="{
            '--button-width': width ?? 'auto',
            '--button-gap': gap,
            '--icon-width': iconWidth,
            '--primary-color': primaryColor ? colorsList[primaryColor] : null,
            '--link-color': linkColor ? colorsList[linkColor] : null,
            '--hover-color': hoverColor ? colorsList[hoverColor] : null,
            '--focus-color': focusColor ? colorsList[focusColor] : null,
        }"
        :target="target"
        v-bind="getAttrs"
        @click="!disabled && $emit('click', $event)"
    >
        <div
            v-if="$slots.icon || icon"
            class="button_icon"
        >
            <slot name="icon">
                <Icon :name="icon" aria-hidden="true" />
            </slot>
        </div>
        <span
            v-if="$slots.default"
            class="button_content"
        >
            <slot name="default"/>
        </span>
        <div
            v-if="$slots.append"
            class="button_append"
        >
            <slot name="append"/>
        </div>
    </component>
</template>

<script setup lang="ts">
import type { PropType, VNode } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';
import type { ColorsList } from '~/utils/styles';
import { colorsList } from '~/utils/styles';

const props = defineProps({
    icon: {
        type: String,
        default: null,
    },
    tag: {
        type: String,
        default: null,
    },
    buttonType: {
        type: String as PropType<'button' | 'submit' | 'reset'>,
        default: 'button',
    },
    width: {
        type: String,
        default: null,
    },
    gap: {
        type: String,
        default: null,
    },
    iconWidth: {
        type: String,
        default: '16px',
    },
    type: {
        type: String as PropType<'primary' | 'secondary' | 'secondary-black' | 'destructive' | 'link' | 'pill' | 'pill-muted' | 'ghost' | 'quiet' | 'dashed' | 'icon-ghost'>,
        default: 'primary',
    },
    active: {
        type: Boolean,
        default: false,
    },
    orientation: {
        type: String as PropType<'vertical' | 'horizontal'>,
        default: 'horizontal',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String as PropType<'M' | 'S'>,
        default: 'M',
    },
    href: {
        type: String,
        default: null,
    },
    target: {
        type: String,
        default: null,
    },
    rel: {
        type: String,
        default: null,
    },
    to: {
        type: [String, Object] as PropType<RouteLocationRaw | string | null | undefined>,
        default: null,
    },
    primaryColor: {
        type: String as PropType<ColorsList | null>,
        default: null,
    },
    linkColor: {
        type: String as PropType<ColorsList>,
        default: 'lightGray200',
    },
    hoverColor: {
        type: String as PropType<ColorsList | null>,
        default: null,
    },
    focusColor: {
        type: String as PropType<ColorsList | null>,
        default: null,
    },
    textAlign: {
        type: String,
        default: 'center',
    },
});

defineEmits({
    click(_event: MouseEvent) {
        return true;
    },
});

defineSlots<{
    default?(): VNode[];
    icon?(): VNode[];
    append?(): VNode[];
}>();

const getTag = computed(() => {
    if (props.disabled) return props.tag ?? 'div';
    if (props.href) return 'a';
    if (props.to) return NuxtLink;
    return props.tag ?? 'div';
});

const getAttrs = computed(() => {
    const attrs: Record<string, RouteLocationRaw | boolean | string> = {};
    if (props.to) {
        attrs.to = props.to;
        attrs.noPrefetch = true;
    }
    else if (props.href) {
        attrs.href = props.href;
        if (props.rel) attrs.rel = props.rel;
    }
    else if (props.tag === 'button') {
        attrs.type = props.buttonType;
    }

    return attrs;
});
</script>

<style scoped lang="scss">
.button {
    --text-primary-color: currentColor;
    cursor: pointer;
    user-select: none;

    display: flex;
    gap: var(--button-gap, 12px);
    align-items: center;
    justify-content: center;

    width: var(--button-width);
    min-height: 44px;
    padding: 8px 20px;
    border: none;
    border-radius: 4px;

    color: $typographyPrimary;
    text-align: v-bind(textAlign);
    text-decoration: none;

    appearance: none;
    background: var(--primary-color, $primary500);
    outline: none;
    box-shadow: none;

    transition:
        color 180ms ease-out,
        background-color 180ms ease-out;

    &:focus-visible {
        outline: 2px solid $primary300;
        outline-offset: 3px;
    }

    &_content {
        display: inline-flex;
        gap: var(--button-gap, 8px);
        align-items: center;

        width: 100%;
        min-width: min-content;
    }

    @include pc {
        &:hover {
            background: var(--hover-color, $primary400);
        }

        &:focus, &:active {
            background: var(--focus-color, $primary600);
        }
    }

    &--type-primary {
        color: $typographyPrimaryOrig;
    }

    &_icon {
        width: var(--icon-width);
        min-width: var(--icon-width);
    }

    &--type-secondary, &--type-destructive {
        background: var(--primary-color, transparent);
    }

    &--type-secondary {
        @include hover {
            &:hover {
                background: var(--hover-color, $whiteAlpha4);
            }

            &:active, &:focus {
                background: var(--focus-color, $primary500);
            }
        }
    }

    &--type-destructive {
        @include hover {
            &:hover {
                background: var(--hover-color, rgb(156 27 88 / 10%));
            }

            &:active, &:focus {
                background: var(--focus-color, rgb(156 27 88 / 18%));
            }
        }

        &:focus-visible {
            outline-color: $error500;
        }
    }

    &--type-secondary-black {
        background: var(--primary-color, $darkgray700);

        @include hover {
            &:hover {
                background: var(--hover-color, $darkgray600);
            }

            &:active, &:focus {
                background: var(--focus-color, $lightgray400);
            }
        }
    }

    &--type-destructive .button_content {
        color: $error600;
    }

    &--orientation-vertical {
        flex-direction: column;
        text-align: center;
    }

    &--icon {
        width: 44px;
        height: 44px;
        padding: 8px;
    }

    &--size-S {
        min-height: 32px;

        &.button--icon {
            width: 32px;
            height: 32px;
        }
    }

    &--type-link {
        justify-content: flex-start;

        height: auto;
        min-height: auto;
        padding: 0;
        border-radius: 0;

        font-size: 10px;
        color: var(--link-color);
        text-align: left;
        text-decoration: underline;

        background: transparent !important;

        &.button--icon {
            width: auto;
        }

        @include hover {
            &:hover {
                color: var(--hover-color);
            }

            &:focus, &:active {
                color: var(--focus-color);
            }
        }
    }

    &--type-pill,
    &--type-pill-muted {
        min-height: 38px;
        padding: 0 0.85rem;
        border: 1px solid transparent;
        border-radius: 999px;

        font-size: 0.82rem;
        color: $lightgray200;

        background: transparent;

        @include hover {
            &:hover {
                border-color: $secondary600;
            }
        }
    }

    &--type-pill-muted {
        color: $lightgray400;
    }

    &--type-pill.button--active,
    &--type-pill-muted.button--active {
        border-color: $secondary600;
        color: $secondary300;
        background: rgb(192 143 46 / 8%);
    }

    &--type-ghost {
        min-height: 40px;
        padding: 0 0.8rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font-size: 0.8rem;
        color: $lightgray150;

        background: transparent;

        @include hover {
            &:hover {
                border-color: $secondary600;
            }
        }
    }

    &--type-quiet {
        min-height: 34px;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font-size: 0.75rem;
        color: $lightgray200;

        background: transparent;

        @include hover {
            &:hover {
                border-color: $secondary600;
                color: $secondary300;
            }
        }
    }

    &--type-dashed {
        min-height: 42px;
        padding: 0 0.9rem;
        border: 1px dashed $darkgray700;
        border-radius: 8px;

        font-size: 0.85rem;
        color: $lightgray200;

        background: transparent;

        @include hover {
            &:hover {
                border-color: $secondary600;
                color: $secondary300;
            }
        }
    }

    &--type-icon-ghost {
        display: inline-grid;
        place-items: center;

        width: 40px;
        min-width: 40px;
        min-height: 40px;
        padding: 0;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        color: $lightgray200;

        background: transparent;
    }

    &--disabled {
        opacity: 0.24;

        &.button--type-primary {
            background: $whiteAlpha2;
        }

        &, &:deep(svg) {
            pointer-events: none;
            cursor: default;
        }
    }
}
</style>