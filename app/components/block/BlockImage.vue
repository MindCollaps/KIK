<template>
    <common-info-section :title="block.title ?? undefined">
        <figure class="block-image">
            <img
                v-if="!hasError"
                :src="block.src"
                :alt="block.alt"
                loading="lazy"
                @error="hasError = true"
            >
            <div v-else class="block-image_fallback" role="status" aria-live="polite">
                <p>{{ block.alt }}</p>
                <p>Das Bild konnte nicht geladen werden.</p>
            </div>
            <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
        </figure>
    </common-info-section>
</template>

<script setup lang="ts">
import type { ImageBlock } from '~~/types/content';

defineProps<{
    block: ImageBlock;
}>();

const hasError = ref(false);
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.block-image {
    margin: 0;

    img {
        display: block;
        width: 100%;
        border-radius: 8px;
    }

    &_fallback {
        display: grid;
        gap: 10px;

        padding: 24px 20px;
        border: 1px dashed $darkgray700;
        border-radius: 14px;

        background: $darkgray875;

        p {
            margin: 0;
            line-height: 1.6;
            color: $lightgray200;
        }

        p:first-child {
            font-weight: 600;
            color: $lightgray50;
        }
    }

    figcaption {
        margin-top: 8px;
        font-size: 11px;
        color: $lightgray300;
    }
}
</style>
