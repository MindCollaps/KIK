<template>
    <main class="content-page" :class="[themeClass, slugClass, { 'content-page--effects-disabled': effectsDisabled }]">
        <slot />
    </main>
</template>

<script setup lang="ts">
const props = defineProps<{
    slug: string;
    themeClass: string;
    effectsDisabled?: boolean;
}>();

const slugClass = computed(() => `content-page--slug-${(props.slug || 'startseite').replace(/[^a-z0-9-]+/g, '-')}`);
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.content-page {
    isolation: isolate;
    position: relative;
    padding-bottom: clamp(3rem, 7vw, 5.5rem);

    &::before,
    &::after {
        pointer-events: none;
        content: '';

        position: fixed;
        z-index: -2;
        inset: 0;
    }

    &::after {
        z-index: -1;
        mix-blend-mode: screen;
    }

    &--effects-disabled {
        &::before,
        &::after {
            display: none;
        }
    }

    &--slug-anfahrt {
        :deep(.common-info-hero_description) {
            text-wrap: pretty;
        }

        :deep(.common-info-section) {
            margin-top: 24px;
        }

        :deep(.common-info-section:nth-of-type(2) .block-markdown p:last-child) {
            display: inline-block;

            margin-top: 16px;
            padding: 10px 14px;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            font-weight: 600;
            color: $lightgray50;

            background: $darkgray875;
        }

        :deep(.common-info-section:nth-of-type(3) img) {
            border-color: $darkgray700;
            border-radius: 14px;
        }

        :deep(.common-info-section:nth-of-type(5) ul) {
            gap: 12px;
            padding-left: 22px;
        }

        :deep(.common-info-section:nth-of-type(5) li) {
            line-height: 1.65;
        }

        :deep(.common-info-section:nth-of-type(5) a) {
            display: inline-flex;
            align-items: center;

            margin-top: 4px;
            padding: 6px 10px;
            border: 1px solid $darkgray700;
            border-radius: 8px;

            text-decoration: none;

            background: $darkgray875;
        }

        @include fromTablet {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 0 20px;

            :deep(.common-info-hero),
            :deep(.arrival-actions),
            :deep(.common-info-section:nth-of-type(5)) {
                grid-column: 1 / -1;
            }

            :deep(.common-info-section:nth-of-type(3)) {
                align-self: start;
            }
        }
    }

    @include mobileOnly {
        &::before,
        &::after {
            position: absolute;
        }
    }
}
</style>
