<template>
    <section class="common-info-section">
        <ui-shell size="info" class="common-info-section_inner">
            <ui-section-title v-if="title">{{ title }}</ui-section-title>
            <slot />
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    title?: string;
}>();

defineSlots<{
    default: () => any;
}>();
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.common-info-section {
    margin-top: clamp(2rem, 3.5vw, 2.6rem);

    &_inner {
        padding: clamp(1.2rem, 2.2vw, 1.8rem);
        border: 1px solid $darkgray800;
        border-radius: 8px;
        background: $darkgray900;
    }

    p,
    li {
        font-size: 15px;
        line-height: 1.75;
        color: $lightgray150;
    }

    ul,
    ol {
        margin: 0;
        padding-left: 20px;
    }

    li {
        margin-top: 8px;

        &:first-child {
            margin-top: 0;
        }
    }

    p + p {
        margin-top: 16px;
    }

    strong {
        font-weight: 600;
        color: $lightgray50;
    }

    a {
        color: $secondary400;
        text-decoration: underline;

        @include hover {
            &:hover {
                color: $secondary300;
            }
        }
    }

    @include mobileOnly {
        &_inner {
            padding: 20px;
        }
    }
}
</style>
