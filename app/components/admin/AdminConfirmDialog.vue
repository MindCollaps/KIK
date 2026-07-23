<template>
    <Teleport to="body">
        <Transition name="confirm-dialog">
            <div
                v-if="open"
                class="confirm-dialog"
                @mousedown.self="onCancel"
            >
                <div
                    class="confirm-dialog_panel"
                    role="alertdialog"
                    aria-modal="true"
                    :aria-labelledby="titleId"
                    :aria-describedby="messageId"
                    @keydown="onKeydown"
                >
                    <h2 :id="titleId" class="confirm-dialog_title">{{ title }}</h2>
                    <p :id="messageId" class="confirm-dialog_message">{{ message }}</p>
                    <div class="confirm-dialog_actions">
                        <ui-button
                            ref="cancelRef"
                            tag="button"
                            type="secondary"
                            :disabled="confirming"
                            @click="onCancel"
                        >
                            {{ cancelLabel }}
                        </ui-button>
                        <ui-button
                            ref="confirmRef"
                            tag="button"
                            type="destructive"
                            :disabled="confirming"
                            @click="emit('confirm')"
                        >
                            <Icon v-if="confirming" name="material-symbols:progress-activity" aria-hidden="true" />
                            {{ confirming ? confirmingLabel : confirmLabel }}
                        </ui-button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmingLabel?: string;
    cancelLabel?: string;
    confirming?: boolean;
}>(), {
    confirmLabel: 'Löschen',
    confirmingLabel: 'Wird ausgeführt …',
    cancelLabel: 'Abbrechen',
    confirming: false,
});

const emit = defineEmits<{
    confirm: [];
    cancel: [];
}>();

const titleId = `confirm-dialog-title-${ Math.random().toString(36).slice(2, 9) }`;
const messageId = `confirm-dialog-message-${ Math.random().toString(36).slice(2, 9) }`;

const panelRef = useTemplateRef('panelRef');
const cancelRef = useTemplateRef('cancelRef');
const confirmRef = useTemplateRef('confirmRef');

let lastFocused: HTMLElement | null = null;

function elOf(component: { $el?: HTMLElement } | HTMLElement | null): HTMLElement | null {
    if (!component) return null;
    return component instanceof HTMLElement ? component : (component.$el ?? null);
}

function onCancel() {
    emit('cancel');
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
        return;
    }

    if (event.key !== 'Tab') return;

    const first = elOf(cancelRef.value);
    const last = elOf(confirmRef.value);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

watch(() => props.open, async isOpen => {
    if (isOpen) {
        lastFocused = document.activeElement as HTMLElement | null;
        await nextTick();
        elOf(cancelRef.value)?.focus();
    }
    else {
        lastFocused?.focus();
        lastFocused = null;
    }
});
</script>

<style scoped lang="scss">
.confirm-dialog {
    position: fixed;
    z-index: 1000;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 1.25rem;

    background: $blackAlpha64;

    &_panel {
        width: min(28rem, 100%);
        padding: 2rem;
        border: 1px solid $darkgray800;
        border-radius: 8px;

        background: $darkgray900;
        box-shadow: 2px 2px 2px rgb(0 0 0 / 25%);
    }

    &_title {
        margin: 0;

        font-size: 1.2rem;
        font-weight: 650;
        line-height: 1.3;
        color: $lightgray0;
    }

    &_message {
        margin: 0.65rem 0 0;

        line-height: 1.6;
        color: $lightgray150;
    }

    &_actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;

        margin-top: 1.5rem;
    }
}

.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
    transition: opacity 180ms ease-out;

    .confirm-dialog_panel {
        transition: transform 180ms ease-out, opacity 180ms ease-out;
    }
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
    opacity: 0;

    .confirm-dialog_panel {
        opacity: 0;
        transform: translateY(4px) scale(0.98);
    }
}

@media (prefers-reduced-motion: reduce) {
    .confirm-dialog-enter-active,
    .confirm-dialog-leave-active,
    .confirm-dialog-enter-active .confirm-dialog_panel,
    .confirm-dialog-leave-active .confirm-dialog_panel {
        transition: none;
    }
}
</style>
