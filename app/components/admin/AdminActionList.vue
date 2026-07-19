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
            <ui-button tag="button" type="icon-ghost" aria-label="Button entfernen" @click="actions.splice(index, 1)">
                <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
            </ui-button>
        </div>
        <ui-button tag="button" type="dashed"
            v-if="actions.length < 4"
            @click="actions.push({ label: '', to: '', style: 'secondary' })"
        >
            <Icon name="material-symbols:add-rounded" aria-hidden="true" />
            Button hinzufügen
        </ui-button>
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

@include mobileOnly {
    .action-row {
        grid-template-columns: 1fr 40px;
    }
}
</style>
