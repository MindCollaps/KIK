<template>
    <div class="app">
        <div
            class="header"
        >
            <nuxt-link
                class="header-text"
                to="/"
            >
                <svg
                    class="header-mark"
                    fill="none"
                    viewBox="0 0 32 32"
                >
                    <rect
                        height="27"
                        rx="7"
                        stroke="currentColor"
                        stroke-width="2.4"
                        width="27"
                        x="2.5"
                        y="2.5"
                    />
                    <path
                        d="M13 11.5L21.5 16L13 20.5V11.5Z"
                        fill="currentColor"
                    />
                </svg>
                <span class="header-text_word">Kino im Kasten</span>
            </nuxt-link>
            <view-menu/>
        </div>
        <div class="app_content">
            <nuxt-loading-indicator :color="colorsList.primary500"/>
            <slot/>
        </div>
        <common-site-footer/>
        <common-toast-container/>
    </div>
</template>

<script setup lang="ts">
import ViewMenu from '~/components/views/ViewMenu.vue';
import { colorsList } from '#imports';
import type { VNode } from 'vue';

defineSlots<{ default: () => VNode[] }>();

useLayout();
</script>

<style lang="scss">
@use "~/scss/layout";
</style>

<style scoped lang="scss">
.header {
    position: sticky;
    z-index: 100;
    top: 0;

    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    padding: 9px 24px;
    border-bottom: 1px solid $darkgray850;

    background: $darkgray1000;

    &-mark {
        width: 26px;
        height: 26px;
        color: $primary500;
    }

    &-text {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: start;

        color: $lightgray0;
        text-decoration: none;

        &_word {
            font-family: $displayFont;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
    }
}
</style>
