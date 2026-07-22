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

        // The exact address is the one line on this page worth remembering,
        // so it gets the theme's own signature treatment: a small marquee
        // bulb, the way a venue name lights up over the door.
        :deep(.common-info-section:nth-of-type(2) .block-markdown p:last-child) {
            display: inline-flex;
            gap: 10px;
            align-items: center;

            margin-top: 16px;
            padding: 10px 14px;
            border: 1px dashed $secondary600;
            border-radius: 8px;

            font-weight: 600;
            color: $lightgray50;

            background: $darkgray875;

            &::before {
                content: '';

                flex: 0 0 auto;

                width: 7px;
                height: 7px;
                border-radius: 50%;

                background: $secondary400;
            }
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

            // Adresse + Mit-dem-Fahrrad-und-Auto (rows 2-3, column 1) are two
            // short cards; the map (column 2) is naturally much taller. Without
            // this, the grid row stretches to the map's height and the shorter
            // Adresse card is left floating over dead space instead. Spanning
            // the map across both rows pairs it against their combined height.
            :deep(.common-info-section:nth-of-type(3)) {
                grid-row: span 2;
                align-self: center;
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
