<template>
    <header class="store-header">
        <div class="store-header_brand">
            <Icon name="material-symbols:point-of-sale" aria-hidden="true" />
            <div>
                <p>Kino im Kasten</p>
                <strong>{{ title }}</strong>
            </div>
        </div>
        <nav class="store-header_nav" aria-label="Kassenbereiche">
            <nuxt-link v-if="can(Permission.KasseUse)" to="/store" class="store-header_link" active-class="store-header_link--active">
                <Icon name="material-symbols:shopping-cart-rounded" aria-hidden="true" />
                Kasse
            </nuxt-link>
            <nuxt-link v-if="can(Permission.KasseManage)" to="/store/admin" class="store-header_link" active-class="store-header_link--active">
                <Icon name="material-symbols:tune-rounded" aria-hidden="true" />
                Verwaltung
            </nuxt-link>
            <nuxt-link v-if="can(Permission.KasseManage)" to="/store/tagesabschluss/neu" class="store-header_link" active-class="store-header_link--active">
                <Icon name="material-symbols:point-of-sale" aria-hidden="true" />
                Tagesabschluss
            </nuxt-link>
            <nuxt-link v-if="canAny(Permission.KasseReports, Permission.KasseReportsEdit, Permission.KasseManage)" to="/store/tagesabschluss" class="store-header_link" exact-active-class="store-header_link--active">
                <Icon name="material-symbols:receipt-long-rounded" aria-hidden="true" />
                Tagesabschlüsse
            </nuxt-link>
            <nuxt-link to="/admin" class="store-header_link store-header_link--muted">
                <Icon name="material-symbols:arrow-back-rounded" aria-hidden="true" />
                Zur Verwaltung
            </nuxt-link>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import { usePermissions } from '~/composables/permissions';

defineProps<{
    title: string;
}>();

const { can, canAny } = usePermissions();
</script>

<style scoped lang="scss">
.store-header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;

    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid $darkgray850;

    background: $darkgray950;

    &_brand {
        display: flex;
        gap: 0.65rem;
        align-items: center;

        > svg {
            width: 1.9rem;
            height: 1.9rem;
            color: $secondary300;
        }

        p {
            margin: 0;

            font-size: 0.65rem;
            font-weight: 700;
            color: $secondary300;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        strong {
            font-size: 1.05rem;
            color: $lightgray0;
        }
    }

    &_nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    &_link {
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;

        min-height: 38px;
        padding: 0 0.85rem;
        border: 1px solid transparent;
        border-radius: 999px;

        font-size: 0.82rem;
        color: $lightgray200;
        text-decoration: none;

        svg {
            width: 1.05rem;
            height: 1.05rem;
        }

        &--active {
            border-color: $secondary600;
            color: $secondary300;
            background: rgb(192 143 46 / 8%);
        }

        &--muted {
            color: $lightgray400;
        }

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 2px;
        }
    }
}

@include mobileOnly {
    .store-header {
        padding: 0.75rem 0.9rem;
    }
}
</style>
