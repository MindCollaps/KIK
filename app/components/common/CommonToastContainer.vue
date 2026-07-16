<template>
    <div class="toast-container">
        <transition-group name="toast-list">
            <common-toast
                v-for="(toast, index) in toasts"
                :key="toast.id"
                class="toast-item"
                :style="{ bottom: `${ (toasts.length - index - 1) * 100 + 32 }px` }"
                :toast="toast"
                @close="store.removeToast(toast.id)"
            />
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStore } from '~/store';

const store = useStore();
const { toasts } = storeToRefs(store);
</script>

<style scoped lang="scss">
.toast-container {
    pointer-events: none;

    position: fixed;
    z-index: var(--z-toast, 60);
    right: 32px;
    bottom: 0;

    display: flex;
    flex-direction: column;
    gap: 12px;
}

.toast-item {
    pointer-events: auto;
    position: fixed;
    right: 32px;
    transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.toast-list-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-list-leave-to {
    transform: translateX(120%);
    opacity: 0;
}

@include mobileOnly {
    .toast-container,
    .toast-item {
        right: 12px;
        left: 12px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .toast-item {
        transition: none;
    }
}
</style>
