import { ToastMode } from '~~/types/toast';
import type { Toast, ShowToastOptions } from '~~/types/toast';
import { useStore } from '~/store';
import { v4 } from 'uuid';

export function useToastManager() {
    const store = useStore();

    const defaultDurationByMode: Record<ToastMode, number> = {
        [ToastMode.Success]: 4500,
        [ToastMode.Info]: 6500,
        [ToastMode.Warning]: 9000,
        [ToastMode.Error]: 10000,
    };

    const showToast = (options: ShowToastOptions) => {
        const mode = options.mode ?? ToastMode.Info;
        const toast: Toast = {
            id: v4(),
            mode,
            title: options.title ?? mode,
            message: options.message,
            duration: options.duration ?? defaultDurationByMode[mode],
        };

        return store.addToast(toast);
    };

    const removeToast = (id: string) => {
        store.removeToast(id);
    };

    return {
        showToast,
        removeToast,
    };
}
