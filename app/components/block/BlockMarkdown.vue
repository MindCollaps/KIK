<template>
    <common-info-section :title="block.title ?? undefined">
        <!-- eslint-disable-next-line vue/no-v-html -- markdown-it renders with html:false, raw HTML is escaped -->
        <div class="block-markdown" v-html="rendered" />
    </common-info-section>
</template>

<script setup lang="ts">
import type { MarkdownBlock } from '~~/types/content';
import { renderMarkdown } from '~/utils/markdown';

const props = defineProps<{
    block: MarkdownBlock;
}>();

const rendered = computed(() => renderMarkdown(props.block.content));
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.block-markdown {
    > :first-child {
        margin-top: 0;
    }

    > :last-child {
        margin-bottom: 0;
    }

    p {
        margin: 12px 0 0;
    }

    ul,
    ol {
        display: grid;
        gap: 10px;
        margin: 12px 0 0;
    }

    // Unordered lists get a small marquee-bulb marker instead of the
    // default disc — the same "lights along the marquee" idea as the
    // theme's own name, applied at the smallest possible scale.
    ul {
        list-style: none;
    }

    li {
        position: relative;

        &::before {
            content: '';

            position: absolute;
            top: 0.65em;
            left: -16px;

            width: 6px;
            height: 6px;
            border-radius: 50%;

            background: $secondary400;
        }
    }

    ol li::before {
        content: none;
    }

    strong {
        color: $lightgray0;
    }

    table {
        overflow-x: auto;
        display: block;
        border-collapse: collapse;

        width: 100%;
        margin: 16px 0 0;
    }

    th {
        padding: 12px 14px;
        border-bottom: 1px solid $darkgray700;

        font-size: 0.75rem;
        line-height: 1.4;
        color: $lightgray300;
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    td {
        padding: 13px 14px;
        border-bottom: 1px solid $darkgray800;
        line-height: 1.5;
    }

    td:last-child,
    th:last-child {
        width: 160px;
        color: $secondary400;
    }

    th:last-child {
        color: $lightgray300;
    }
}
</style>
