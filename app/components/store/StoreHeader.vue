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
            <ui-button v-if="can(Permission.KasseUse)" to="/store" type="pill" active-class="button--active">
                <Icon name="material-symbols:shopping-cart-rounded" aria-hidden="true" />
                Kasse
            </ui-button>
            <ui-button v-if="can(Permission.KasseManage)" to="/store/admin" type="pill" active-class="button--active">
                <Icon name="material-symbols:tune-rounded" aria-hidden="true" />
                Verwaltung
            </ui-button>
            <ui-button v-if="can(Permission.KasseReports)" to="/store/tagesabschluss/neu" type="pill" active-class="button--active">
                <Icon name="material-symbols:point-of-sale" aria-hidden="true" />
                Tagesabschluss
            </ui-button>
            <ui-button v-if="can(Permission.KasseReports)" to="/store/tagesabschluss" type="pill" exact-active-class="button--active">
                <Icon name="material-symbols:receipt-long-rounded" aria-hidden="true" />
                Tagesabschlüsse
            </ui-button>
            <ui-button to="/admin" type="pill-muted">
                <Icon name="material-symbols:arrow-back-rounded" aria-hidden="true" />
                Zur Verwaltung
            </ui-button>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { Permission } from '~~/types/permissions';
import { usePermissions } from '~/composables/permissions';

defineProps<{
    title: string;
}>();

const { can } = usePermissions();
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
}

@include mobileOnly {
    .store-header {
        padding: 0.75rem 0.9rem;
    }
}
</style>
