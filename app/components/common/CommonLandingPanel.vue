<template>
    <section class="common-landing-panel">
        <ui-shell size="wide" class="common-landing-panel_inner" :class="{ 'common-landing-panel_inner--split': split }">
            <ui-section-title>{{ title }}</ui-section-title>
            <slot />
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    split?: boolean;
}>(), {
    split: false,
});

defineSlots<{
    default: () => any;
}>();
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.common-landing-panel {
    margin-top: 20px;

    &_inner {
        padding: 22px;
        border: 1px solid $darkgray800;
        border-radius: 14px;
        background: rgb(29 24 21 / 86%);

        p,
        li {
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: $lightgray150;
        }

        p + p {
            margin-top: 12px;
        }

        a {
            color: $secondary400;
        }

        &--split {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;

            ul {
                display: grid;
                gap: 8px;
                margin: 0;
                padding-left: 18px;
            }

            @media all and (max-width: 1365px) {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
