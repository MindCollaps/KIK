<template>
    <footer class="site-footer">
        <ui-shell size="wide" class="site-footer_inner">
            <div class="site-footer_identity">
                <ui-button class="site-footer_brand" to="/" type="link">
                    <common-brand-mark aria-hidden="true" />
                    <span>Kino im Kasten</span>
                </ui-button>
                <p>{{ footer.description }}</p>
                <a
                    v-if="footer.addressLabel && footer.addressUrl"
                    class="site-footer_address"
                    :href="footer.addressUrl"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    <Icon name="material-symbols:location-on-rounded" aria-hidden="true" />
                    {{ footer.addressLabel }}
                </a>
            </div>

            <nav
                v-for="group in footer.groups"
                :key="group.title"
                class="site-footer_group"
                :aria-label="group.title"
            >
                <h2>{{ group.title }}</h2>
                <template v-for="link in group.links" :key="link.label">
                    <ui-button v-if="link.to.startsWith('/')" :to="link.to" type="link">
                        <Icon :name="link.icon ?? 'material-symbols:link-rounded'" aria-hidden="true" />{{ link.label }}
                    </ui-button>
                    <a
                        v-else
                        :href="link.to"
                        :target="link.to.startsWith('http') ? '_blank' : undefined"
                        rel="noreferrer noopener"
                    >
                        <Icon :name="link.icon ?? 'material-symbols:link-rounded'" aria-hidden="true" />{{ link.label }}
                    </a>
                </template>
            </nav>
        </ui-shell>

        <ui-shell size="wide" class="site-footer_bottom">
            <span>© {{ currentYear }} {{ footer.bottomLeft }}</span>
            <span>{{ footer.bottomRight }}</span>
        </ui-shell>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const site = useSiteConfigState();
const footer = computed(() => site.value.footer);
</script>

<style scoped lang="scss">
.site-footer {
    border-top: 1px solid $darkgray800;
    background: $darkgray1000;

    &_inner {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(150px, 0.75fr));
        gap: clamp(2rem, 6vw, 5rem);

        padding-top: clamp(2.4rem, 5vw, 4rem);
        padding-bottom: clamp(2rem, 4vw, 3rem);
    }

    &_brand {
        display: inline-flex;
        gap: 0.65rem;
        align-items: center;

        font-family: $displayFont;
        font-size: 1.65rem;
        color: $lightgray0;
        text-decoration: none;
        text-transform: uppercase;

        svg {
            width: 2rem;
            height: 2rem;
            color: $primary500;
        }
    }

    &_identity p {
        max-width: 38ch;
        margin: 0.85rem 0 0;
        line-height: 1.6;
        color: $lightgray300;
    }

    &_address {
        display: inline-flex;
        gap: 0.45rem;
        align-items: center;

        min-height: 44px;
        margin-top: 0.75rem;

        color: $secondary300;
        text-underline-offset: 0.2em;

        svg {
            flex: 0 0 auto;
            width: 1.05rem;
            height: 1.05rem;
        }
    }

    &_group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        h2 {
            margin: 0 0 0.65rem;

            font-size: 0.75rem;
            color: $lightgray300;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        a {
            display: inline-flex;
            gap: 0.5rem;
            align-items: center;

            min-height: 38px;

            color: $lightgray150;
            text-decoration: none;

            svg {
                width: 1rem;
                height: 1rem;
                color: $secondary400;
            }

            &:hover {
                color: $lightgray0;
            }
        }
    }

    &_bottom {
        display: flex;
        gap: 1rem;
        justify-content: space-between;

        padding-top: 1rem;
        padding-bottom: 1rem;
        border-top: 1px solid $darkgray850;

        font-size: 0.75rem;
        color: $lightgray400;
    }
}

@include mobileOnly {
    .site-footer {
        &_inner {
            grid-template-columns: 1fr 1fr;
            gap: 2rem 1.25rem;
        }

        &_identity {
            grid-column: 1 / -1;
        }

        &_bottom {
            flex-direction: column;
            align-items: flex-start;
        }
    }
}
</style>
