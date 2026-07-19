<template>
    <div class="action-list">
        <p class="action-list_label">Buttons</p>
        <div v-for="(action, index) in actions" :key="index" class="action-row">
            <input v-model.trim="action.label" maxlength="80" placeholder="Beschriftung">
            <input v-model.trim="action.to" maxlength="1000" placeholder="/pfad oder https://…">
            <ui-select v-model="action.style">
                <option value="primary">Primär</option>
                <option value="secondary">Sekundär</option>
            </ui-select>
            <button type="button" class="icon-button" aria-label="Button entfernen" @click="actions.splice(index, 1)">
                <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
            </button>
        </div>
        <button
            v-if="actions.length < 4"
            type="button"
            class="add-button"
            @click="actions.push({ label: '', to: '', style: 'secondary' })"
        >
            <Icon name="material-symbols:add-rounded" aria-hidden="true" />
            Button hinzufügen
        </button>
    </div>
</template>

<script setup lang="ts">
import type { BlockAction } from '~~/types/content';

const actions = defineModel<BlockAction[]>({ required: true });
</script>

<style scoped lang="scss">
.action-list {
    display: grid;
    gap: 0.5rem;

    &_label {
        margin: 0;

        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.action-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto 40px;
    gap: 0.5rem;

    input {
        min-height: 42px;
        padding: 0.5rem 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.85rem;
        color: $lightgray50;

        background: $darkgray950;
        outline: none;

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }
}

.icon-button {
    cursor: pointer;

    display: grid;
    place-items: center;

    min-width: 40px;
    min-height: 40px;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    color: $lightgray200;

    background: transparent;

    &:hover {
        color: $error300;
        background: rgb(194 37 105 / 8%);
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.add-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;

    min-height: 40px;
    padding: 0 0.8rem;
    border: 1px dashed $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.8rem;
    color: $lightgray200;

    background: transparent;

    &:hover {
        border-color: $secondary600;
        color: $secondary300;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

@include mobileOnly {
    .action-row {
        grid-template-columns: 1fr 40px;
    }
}
</style>
