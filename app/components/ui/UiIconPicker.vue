<template>
    <div
        ref="rootRef"
        class="icon-picker"
    >
        <div
            v-if="$slots.default"
            class="icon-picker-label"
        >
            <slot/>
        </div>
        <div
            class="icon-picker-trigger"
            :class="{ 'icon-picker-trigger--open': isOpen }"
            @click="toggle"
        >
            <Icon
                v-if="modelValue"
                class="icon-picker-current"
                :name="modelValue"
                size="18"
            />
            <span
                v-else
                class="icon-picker-current icon-picker-current--empty"
            >—</span>
            <span class="icon-picker-name">{{ modelValue || 'Icon auswählen…' }}</span>
            <Icon
                class="icon-picker-chevron"
                :class="{ 'icon-picker-chevron--open': isOpen }"
                name="material-symbols:expand-more"
                size="18"
            />
        </div>

        <teleport to="body">
            <div
                v-if="isOpen"
                ref="panelRef"
                class="icon-picker-panel"
                :style="panelStyle"
            >
                <input
                    ref="searchRef"
                    v-model="query"
                    class="icon-picker-search"
                    placeholder="Icons suchen…"
                    type="text"
                    @input="debouncedSearch"
                >
                <div
                    v-if="loading"
                    class="icon-picker-state"
                >
                    Suchen…
                </div>
                <div
                    v-else-if="results.length === 0"
                    class="icon-picker-state"
                >
                    {{ query ? 'Keine Icons gefunden' : 'Tippe um zu suchen' }}
                </div>
                <div
                    v-else
                    class="icon-picker-grid"
                >
                    <ui-button
                        v-for="icon in results"
                        :key="icon"
                        class="icon-picker-option"
                        :class="{ 'icon-picker-option--active': icon === modelValue }"
                        :title="icon.split(':')[1]"
                        tag="button"
                        type="secondary"
                        @click="select(icon)"
                    >
                        <Icon
                            :name="icon"
                            size="20"
                        />
                    </ui-button>
                </div>
                <div
                    v-if="modelValue"
                    class="icon-picker-footer"
                >
                    <ui-button
                        class="icon-picker-clear"
                        tag="button"
                        type="secondary"
                        @click="clear"
                    >
                        Icon entfernen
                    </ui-button>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import type { VNode } from 'vue';

defineProps<{
    modelValue: string | null;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

defineSlots<{ default?(): VNode[] }>();

const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);
const query = ref('');
const results = ref<string[]>([]);
const loading = ref(false);
const panelStyle = ref<Record<string, string>>({});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function search(q: string) {
    if (!q.trim()) {
        results.value = [];
        loading.value = false;
        return;
    }
    loading.value = true;
    try {
        results.value = await $fetch<string[]>('/api/admin/icon-search', { query: { q: q.trim() } });
    }
    catch {
        results.value = [];
    }
    finally {
        loading.value = false;
    }
}

function debouncedSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(query.value), 280);
}

const PANEL_MAX_HEIGHT = 340;

function updatePosition() {
    if (!rootRef.value) return;
    const rect = rootRef.value.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, 320);

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

async function open() {
    isOpen.value = true;
    updatePosition();
    await nextTick();
    searchRef.value?.focus();
    if (query.value) await search(query.value);
}

function close() {
    isOpen.value = false;
}

async function toggle() {
    if (isOpen.value) close();
    else await open();
}

function select(icon: string) {
    emit('update:modelValue', icon);
    close();
}

function clear() {
    emit('update:modelValue', '');
    close();
}

function onClickOutside(e: MouseEvent) {
    if (!isOpen.value) return;
    const target = e.target as Node;
    if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return;
    close();
}

onMounted(() => {
    document.addEventListener('click', onClickOutside, true);
});
onUnmounted(() => {
    document.removeEventListener('click', onClickOutside, true);
    if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style scoped lang="scss">
.icon-picker {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-label {
        font-size: 13px;
        font-weight: 600;
        color: $typographyPrimary;
    }

    &-trigger {
        cursor: pointer;
        user-select: none;

        display: flex;
        gap: 10px;
        align-items: center;

        width: 100%;
        height: 40px;
        padding: 0 12px;
        border: 2px solid transparent;
        border-radius: 8px;

        font-size: 13px;
        color: $lightgray150;

        background: $darkgray900;
        outline: none;

        transition: border-color 0.15s;

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }

        &--open {
            border-color: $primary500;
        }
    }

    &-current {
        flex-shrink: 0;
        color: $lightgray200;

        &--empty {
            color: $darkgray600;
        }
    }

    &-name {
        overflow: hidden;
        flex: 1;

        min-width: 0;

        font-family: monospace;
        font-size: 11px;
        color: $lightgray400;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &-chevron {
        flex-shrink: 0;
        color: $darkgray600;
        transition: transform 0.15s;

        &--open {
            transform: rotate(180deg);
        }
    }
}

.icon-picker-panel {
    position: fixed;
    z-index: 200;

    overflow: hidden;

    border: 1px solid $darkgray800;
    border-radius: 8px;

    background: $darkgray875;
    box-shadow: 0 8px 24px rgb(0 0 0 / 40%);

    animation: icon-panel-appear 0.15s cubic-bezier(0.25, 1, 0.5, 1) both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
}

@keyframes icon-panel-appear {
    from {
        transform: translateY(-4px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.icon-picker-search {
    display: block;

    width: 100%;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid $darkgray800;
    border-radius: 0;

    font-family: $defaultFont;
    font-size: 13px;
    color: $lightgray150;

    background: $darkgray900;
    outline: none;

    &::placeholder {
        color: $darkgray600;
    }
}

.icon-picker-state {
    padding: 20px;
    font-size: 12px;
    color: $darkgray600;
    text-align: center;
}

.icon-picker-grid {
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;

    max-height: 240px;
    padding: 8px;
}

.icon-picker-option {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;

    color: $lightgray300;

    background: transparent;
    outline: none;

    transition: background 0.1s, color 0.1s;

    @include hover {
        &:hover {
            color: $lightgray100;
            background: $darkgray800;
        }
    }

    &--active {
        color: $primary400;
        background: color-mix(in srgb, #{$primary500} 20%, transparent);

        @include hover {
            &:hover {
                background: color-mix(in srgb, #{$primary500} 30%, transparent);
            }
        }
    }
}

.icon-picker-footer {
    padding: 8px;
    border-top: 1px solid $darkgray800;
}

.icon-picker-clear {
    cursor: pointer;

    display: block;

    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;

    font-family: $defaultFont;
    font-size: 11px;
    color: $lightgray400;
    text-align: left;

    background: transparent;
    outline: none;

    transition: background 0.1s, color 0.1s;

    @include hover {
        &:hover {
            color: $error500;
            background: $darkgray800;
        }
    }
}
</style>
