<template>
    <section class="block-network">
        <ui-shell size="wide" class="block-network_layout">
            <article class="block-network_panel">
                <h2>{{ block.socialTitle }}</h2>
                <ul>
                    <li v-for="channel in block.socialLinks" :key="channel.label">
                        <a :href="channel.url" target="_blank" rel="noreferrer noopener">
                            <Icon :name="channel.icon ?? 'material-symbols:link-rounded'" aria-hidden="true" />
                            {{ channel.label }}
                        </a>
                    </li>
                </ul>
            </article>

            <article class="block-network_panel block-network_panel--support">
                <h2>{{ block.supportTitle }}</h2>
                <p v-if="block.supportText">{{ block.supportText }}</p>

                <div v-if="block.supporters.length" class="block-network_supporters">
                    <a
                        v-for="supporter in block.supporters"
                        :key="supporter.label"
                        :href="supporter.url"
                        target="_blank"
                        rel="noreferrer noopener"
                        class="supporter-link"
                    >
                        <img
                            v-if="supporter.image"
                            :src="supporter.image"
                            :alt="supporter.label"
                            width="180"
                            height="64"
                            loading="lazy"
                        >
                        <Icon v-else :name="supporter.icon ?? 'material-symbols:handshake-rounded'" aria-hidden="true" />
                        <span class="supporter-link_label">{{ supporter.label }}</span>
                        <span v-if="supporter.role" class="supporter-link_role">{{ supporter.role }}</span>
                    </a>
                </div>
            </article>
        </ui-shell>
    </section>
</template>

<script setup lang="ts">
import type { NetworkBlock } from '~~/types/content';

defineProps<{
    block: NetworkBlock;
}>();
</script>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.block-network {
    margin-top: clamp(2.6rem, 5.6vw, 4.6rem);

    &_layout {
        display: grid;
        grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
        gap: 0.9rem;
    }

    &_panel {
        min-width: 0;
        padding: clamp(1rem, 2.1vw, 1.5rem);
        border: 1px solid $darkgray800;
        border-radius: 14px;

        background: rgb(29 24 21 / 88%);

        h2 {
            margin: 0;

            font-family: $displayFont;
            font-size: clamp(1.8rem, 3.7vw, 2.7rem);
            font-weight: 400;
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        p {
            margin: 0.9rem 0 0;
            line-height: 1.65;
            color: $lightgray150;
            text-wrap: pretty;
        }

        ul {
            display: grid;
            gap: 0.45rem;
            margin: 0.9rem 0 0;
            padding-left: 1rem;
        }

        li {
            color: $lightgray200;
        }

        a {
            display: inline-flex;
            gap: 0.45rem;
            align-items: center;

            color: $secondary300;
            text-decoration-color: rgb(232 203 146 / 55%);
            text-underline-offset: 0.16em;
            overflow-wrap: anywhere;

            svg {
                flex: 0 0 auto;
                width: 1rem;
                height: 1rem;
            }

            &:focus-visible {
                border-radius: 2px;
                outline: 2px solid $primary400;
                outline-offset: 3px;
            }
        }
    }

    &_supporters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
        gap: 0.65rem;
        margin-top: 1rem;
    }
}

.supporter-link {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 7.2rem;
    padding: 0.8rem;
    border: 1px solid $darkgray700;
    border-radius: 10px;

    font-weight: 650;
    color: $lightgray150;
    text-align: center;
    text-decoration: none;

    background: rgb(36 30 26 / 88%);

    &:focus-visible {
        border-color: $primary400;
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }

    img {
        width: min(150px, 100%);
        height: 52px;
        object-fit: contain;
    }

    > svg {
        width: 2.4rem;
        height: 2.4rem;
        color: $secondary300;
    }

    &_label {
        font-size: 0.76rem;
        line-height: 1.25;
        color: $lightgray150;
    }

    &_role {
        font-size: 0.65rem;
        color: $secondary300;
        text-transform: uppercase;
        letter-spacing: 0.07em;
    }
}

@include mobile {
    .block-network_layout {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: no-preference) {
    .block-network_panel {
        animation: block-network-reveal 420ms ease-out both;
    }

    .block-network_panel:last-child {
        animation-delay: 160ms;
    }
}

@keyframes block-network-reveal {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
