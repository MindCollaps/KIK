<template>
    <header class="admin-header">
        <ui-button class="admin-brand" to="/" type="link">
            <span class="admin-brand_mark"><Icon name="material-symbols:play-arrow-rounded" aria-hidden="true" /></span>
            <span>Kino im Kasten</span>
        </ui-button>
        <div v-if="user" class="admin-user">
            <span>{{ user.name }}</span>
            <ui-button type="secondary" tag="button" @click="$emit('logout')">
                <Icon name="material-symbols:logout-rounded" aria-hidden="true" />
                Abmelden
            </ui-button>
        </div>
        <ui-button v-else class="back-link" to="/" type="link">
            <Icon name="material-symbols:arrow-back-rounded" aria-hidden="true" />
            Zur Website
        </ui-button>
    </header>
</template>

<script setup lang="ts">
import type { AdminUser } from '~~/types/user';

defineProps<{
    user: AdminUser | null;
}>();

defineEmits<{
    logout: [];
}>();
</script>

<style scoped lang="scss">
.admin-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;

    min-height: 64px;
    padding: 0 1.5rem;
    border-bottom: 1px solid $darkgray850;

    background: rgb(15 12 10 / 94%);
}

.admin-brand,
.back-link,
.admin-user :deep(.button) {
    display: inline-flex;
    gap: 0.55rem;
    align-items: center;

    min-height: 44px;

    color: $lightgray100;
    text-decoration: none;

    &:focus-visible {
        border-radius: 2px;
        outline: 2px solid $primary400;
        outline-offset: 3px;
    }
}

.admin-brand {
    font-family: $displayFont;
    font-size: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;

    :deep(.button_content) {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        width: auto;
        min-width: 0;
        white-space: nowrap;
    }

    &_mark {
        display: inline-grid;
        place-items: center;

        width: 32px;
        height: 32px;
        border: 2px solid $primary500;
        border-radius: 8px;

        color: $primary400;
    }
}

.admin-user {
    display: flex;
    gap: 0.75rem;
    align-items: center;

    > span {
        font-size: 0.8rem;
        color: $lightgray300;
    }

    :deep(.button) {
        cursor: pointer;
        padding: 0 0.7rem;
        border: 1px solid $darkgray700;
        border-radius: 6px;

        font: inherit;

        background: transparent;
    }
}

@include mobileOnly {
    .admin-header {
        padding: 0 0.8rem;
    }

    .admin-user > span {
        display: none;
    }
}
</style>
