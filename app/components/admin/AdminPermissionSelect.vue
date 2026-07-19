<template>
    <div ref="rootRef" class="permission-select">
        <div v-if="$slots.default" class="permission-select_label">
            <slot/>
        </div>
        <ui-button tag="button" type="secondary"
            class="permission-select_trigger"
            :class="{ 'permission-select_trigger--open': isOpen }"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            @click="toggle"
        >
            <Icon name="material-symbols:shield-person-outline-rounded" aria-hidden="true" />
            <span class="permission-select_summary">{{ summary }}</span>
            <Icon
                class="permission-select_chevron"
                :class="{ 'permission-select_chevron--open': isOpen }"
                name="material-symbols:expand-more"
                aria-hidden="true"
            />
        </ui-button>

        <teleport to="body">
            <div
                v-if="isOpen"
                ref="panelRef"
                class="permission-select-panel"
                role="listbox"
                aria-multiselectable="true"
                :style="panelStyle"
            >
                <ui-checkbox
                    v-for="permission in allPermissions"
                    :key="permission"
                    class="permission-select-option"
                    :model-value="modelValue.includes(permission)"
                    @update:model-value="togglePermission(permission)"
                >
                    {{ permissionLabels[permission] }}
                </ui-checkbox>
            </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue';
import type { Permission } from '~~/types/permissions';
import { allPermissions, permissionLabels } from '~~/types/permissions';

const props = defineProps<{
    modelValue: Permission[];
}>();

const emit = defineEmits<{
    'update:modelValue': [value: Permission[]];
}>();

defineSlots<{ default?(): VNode[] }>();

const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const panelStyle = ref<Record<string, string>>({});

const summary = computed(() => {
    if (props.modelValue.length === 0) return 'Keine Berechtigungen';
    if (props.modelValue.length === allPermissions.length) return 'Alle Berechtigungen';
    if (props.modelValue.length === 1) return '1 Berechtigung';
    return `${ props.modelValue.length } Berechtigungen`;
});

function togglePermission(permission: Permission) {
    const next = props.modelValue.includes(permission)
        ? props.modelValue.filter(entry => entry !== permission)
        : [...props.modelValue, permission];
    emit('update:modelValue', next);
}

const PANEL_MAX_HEIGHT = 300;

function updatePosition() {
    if (!rootRef.value) return;
    const rect = rootRef.value.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, 260);

    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;

    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openAbove = spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow;

    panelStyle.value = {
        top: openAbove ? `${ rect.top - PANEL_MAX_HEIGHT - 4 }px` : `${ rect.bottom + 4 }px`,
        left: `${ left }px`,
        width: `${ panelWidth }px`,
    };
}

function toggle() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) updatePosition();
}

function onClickOutside(e: MouseEvent) {
    if (!isOpen.value) return;
    const target = e.target as Node;
    if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return;
    isOpen.value = false;
}

onMounted(() => {
    document.addEventListener('click', onClickOutside, true);
});
onUnmounted(() => {
    document.removeEventListener('click', onClickOutside, true);
});
</script>

<style scoped lang="scss">
.permission-select {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    &_label {
        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;
    }

    &_trigger {
        cursor: pointer;
        user-select: none;

        display: flex;
        gap: 0.5rem;
        align-items: center;

        min-height: 40px;
        padding: 0 0.75rem;
        border: 1px solid $darkgray700;
        border-radius: 8px;

        font: inherit;
        font-size: 0.82rem;
        color: $lightgray150;

        background: $darkgray950;

        transition: border-color 0.15s;

        svg {
            flex-shrink: 0;
            width: 1.05rem;
            height: 1.05rem;
            color: $lightgray300;
        }

        &--open {
            border-color: $primary400;
        }

        &:focus-visible {
            border-color: $primary400;
            outline: 2px solid rgb(221 91 69 / 22%);
        }
    }

    &_summary {
        overflow: hidden;
        flex: 1;

        min-width: 0;

        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &_chevron {
        transition: transform 0.15s;

        &--open {
            transform: rotate(180deg);
        }
    }
}

.permission-select-panel {
    position: fixed;
    z-index: 200;

    overflow-y: auto;
    display: grid;
    gap: 0.1rem;

    max-height: 300px;
    padding: 0.4rem;
    border: 1px solid $darkgray800;
    border-radius: 8px;

    background: $darkgray875;
    box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
}

.permission-select-option {
    padding: 0.45rem 0.55rem;
    border-radius: 6px;

    font-size: 0.82rem;
    color: $lightgray150;

    transition: background 0.1s;

    &:hover {
        background: $darkgray800;
    }
}
</style>
