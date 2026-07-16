<template>
    <common-info-section :title="block.title ?? undefined">
        <div class="block-card-grid">
            <article
                v-for="(card, index) in block.cards"
                :key="index"
                class="block-card-grid_card"
            >
                <h3>{{ card.title }}</h3>
                <p>{{ card.text }}</p>
                <p v-if="card.meta" class="block-card-grid_meta">{{ card.meta }}</p>
            </article>
        </div>
    </common-info-section>
</template>

<script setup lang="ts">
import type { CardGridBlock } from '~~/types/content';

defineProps<{
    block: CardGridBlock;
}>();
</script>

<style scoped lang="scss">
.block-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;

    &_card {
        padding: 18px;
        border: 1px solid $darkgray800;
        border-radius: 8px;
        background: $darkgray875;

        h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            line-height: 1.3;
            color: $lightgray50;
        }

        p {
            margin: 10px 0 0;
            font-size: 14px;
            line-height: 1.6;
            color: $lightgray150;
        }
    }

    &_meta {
        font-weight: 600;
        font-size: 13px;
        color: $secondary400;
    }

    @include hover {
        &_card {
            transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
            border-color: $darkgray700;
            box-shadow: 0 4px 12px rgba($blackOrig, 0.3);
        }
    }

    @include mobileOnly {
        grid-template-columns: 1fr;
    }
}
</style>
