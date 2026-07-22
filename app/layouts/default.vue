<template>
    <div class="app">
        <div
            class="header"
        >
            <ui-button
                class="header-text"
                to="/"
                type="link"
            >
                <common-brand-mark class="header-mark" />
                <span class="header-text_word">Kino im Kasten</span>
            </ui-button>
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

        :deep(.button_content) {
            display: inline-flex;
            gap: 8px;
            align-items: center;

            width: auto;
            min-width: 0;
        }

        &_word {
            font-family: $displayFont;
            font-size: 20px;
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
    }
}
</style>
