<template>
    <section class="block-split">
        <ui-shell size="wide" class="block-split_inner">
            <div>
                <ui-section-title tag="h2">{{ block.title }}</ui-section-title>
                <!-- eslint-disable-next-line vue/no-v-html -- markdown-it renders with html:false, raw HTML is escaped -->
                <div class="block-split_body" v-html="renderedBody" />
                <NuxtLink v-if="block.linkLabel && block.linkTo" class="block-split_link" :to="block.linkTo">
                    {{ block.linkLabel }}
                    <Icon name="material-symbols:arrow-forward-rounded" aria-hidden="true" />
                </NuxtLink>
            </div>

            <ul v-if="block.points.length" class="block-split_points">
                <li v-for="(point, index) in block.points" :key="index">{{ point }}</li>
            </ul>
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { SplitBlock } from '~~/types/content';
import { renderMarkdown } from '~/utils/markdown';

const props = defineProps<{
    block: SplitBlock;
}>();

const renderedBody = computed(() => renderMarkdown(props.block.body));
</script>

<style lang="scss">
@use '~/scss/variables' as *;

.block-split {
    margin-top: clamp(2.8rem, 5.8vw, 5rem);

    &_inner {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
        gap: clamp(1.2rem, 2.8vw, 2.4rem);
        align-items: start;
    }

    &_body p {
        max-width: 66ch;
        margin: 0.95rem 0 0;

        line-height: 1.72;
        color: $lightgray150;
        text-wrap: pretty;
    }

    &_points {
        display: grid;
        gap: 0.75rem;

        margin: 0;
        padding: 1rem 1rem 1rem 2rem;
        border: 1px solid $darkgray800;
        border-radius: 14px;

        background: rgb(29 24 21 / 86%);

        li {
            line-height: 1.6;
            color: $lightgray150;
        }
    }

    &_link {
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;

        min-height: 44px;
        margin-top: 0.8rem;

        font-weight: 700;
        color: $secondary300;
        text-underline-offset: 0.2em;

        svg {
            width: 1rem;
            height: 1rem;
        }

        &:focus-visible {
            border-radius: 2px;
            outline: 2px solid $primary400;
            outline-offset: 3px;
        }
    }

    @include mobile {
        &_inner {
            grid-template-columns: 1fr;
        }

        &_points {
            padding-left: 1.7rem;
        }
    }
}
</style>
