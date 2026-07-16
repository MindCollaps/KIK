<template>
    <div
        class="toast"
        :role="toast.mode === ToastMode.Error ? 'alert' : 'status'"
        :aria-live="toast.mode === ToastMode.Error ? 'assertive' : 'polite'"
    >
        <div class="toast-header">
            <div
                :class="`toast-icon toast-icon--${ toast.mode.toLowerCase() }`"
            >
                <Icon
                    :name="toastIcon[toast.mode]"
                    size="24px"
                />
            </div>

            <div class="toast-title">{{ toast.title }}</div>

            <button
                aria-label="Schließen"
                class="toast-close"
                type="button"
                @click="emit('close')"
            >
                <icon name="material-symbols:close-rounded"/>
            </button>
        </div>
        <div
            v-if="toast.message"
            class="toast-content"
        >
            {{ toast.message }}
        </div>
    </div>
</template>


<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import type { Toast } from '~~/types/toast';

defineProps<{
    toast: Toast;
}>();

const emit = defineEmits<{
    close: [];
}>();

const toastIcon = {
    [ToastMode.Info]: 'material-symbols:info',
    [ToastMode.Warning]: 'material-symbols:warning',
    [ToastMode.Error]: 'material-symbols:error',
    [ToastMode.Success]: 'material-symbols:check-circle',
};
</script>

<style scoped lang="scss">
    .toast {
        display: flex;
        flex-direction: column;

        width: min(420px, calc(100vw - 2rem));
        max-width: 420px;
        padding: 16px 20px;
        border-radius: 8px;

        background: $lightgray50;
        box-shadow: 2px 2px 2px rgb(0 0 0 / 25%);

        &-header {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        &-title {
            flex: 1;

            font-size: 14px;
            font-weight: 600;
            color: $darkgray900;
            text-wrap: pretty;
        }

        &-icon {
            &--success {
                color: $success500;
            }

            &--error {
                color: $error500;
            }

            &--warning {
                color: $warning500;
            }

            &--info {
                color: $info500;
            }
        }

        &-close {
            cursor: pointer;

            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;

            width: 32px;
            height: 32px;
            padding: 0;
            border: none;
            border-radius: 4px;

            color: $darkgray700;

            opacity: 0.7;

            transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

            &:hover {
                color: $darkgray900;
                opacity: 1;
                background: rgb(0 0 0 / 5%);
            }

            &:focus-visible {
                outline: 2px solid $primary400;
                outline-offset: 2px;
            }
        }

        &-content {
            margin-top: 8px;
            padding-left: 36px;

            font-size: 14px;
            line-height: 1.45;
            color: $darkgray800;
            text-wrap: pretty;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .toast-close {
            transition: none;
        }
    }
</style>
