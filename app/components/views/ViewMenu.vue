<template>
    <div class="header__menu" aria-label="Hauptnavigation">
        <div
            v-for="button in headerMenu"
            :key="button.text"
            class="header__menu_btn-wrapper"
            :class="{ 'header__menu_btn-wrapper--has-children': button.children }"
        >
            <ui-button
                class="header__menu_btn-container"
                :disabled="button.disabled"
                :icon="button.icon"
                :to="button.path"
                :type="button.active ? 'secondary-black' : 'secondary'"
                :width="button.width"
                @click="button.action?.()"
            >
                <div class="header__menu_btn">
                    <div class="header__menu_btn_text">
                        {{ button.text }}
                    </div>
                    <div
                        v-if="button.children"
                        class="header__menu_btn_children"
                    >
                        <Icon
                            class="header__menu_btn_children_icon"
                            name="material-symbols:arrow-drop-down-rounded"
                        />
                    </div>
                </div>
            </ui-button>
            <div
                v-if="button.children"
                class="header__menu_btn_children_menu"
            >
                <ui-button
                    v-for="childrenButton in button.children"
                    :key="childrenButton.text"
                    :disabled="childrenButton.disabled"
                    :icon="childrenButton.icon"
                    :to="childrenButton.path"
                    :type="childrenButton.active ? 'primary' : 'secondary'"
                    @click="childrenButton.action?.()"
                >
                    {{ childrenButton.text }}
                </ui-button>
            </div>
        </div>
    </div>

    <button
        ref="menuTrigger"
        class="mobile-menu-trigger"
        type="button"
        aria-label="Menü öffnen"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        @click="openMenu"
    >
        <Icon name="material-symbols:menu-rounded" aria-hidden="true" />
    </button>

    <Teleport to="body">
        <Transition name="mobile-menu">
            <div
                v-if="isMenuOpen"
                id="mobile-menu"
                ref="mobileMenu"
                class="mobile-menu-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Hauptmenü"
                @keydown="handleMenuKeydown"
            >
                <header class="mobile-menu-overlay_header">
                    <p>Kino im Kasten</p>
                    <button
                        class="mobile-menu-close"
                        type="button"
                        aria-label="Menü schließen"
                        @click="closeMenu()"
                    >
                        <Icon name="material-symbols:close-rounded" aria-hidden="true" />
                    </button>
                </header>

                <nav class="mobile-menu-links" aria-label="Mobile Hauptnavigation">
                    <NuxtLink
                        v-for="(button, index) in headerMenu"
                        :key="button.text"
                        class="mobile-menu-link"
                        :class="{ 'mobile-menu-link--active': button.active }"
                        :to="button.path"
                        :aria-current="button.active ? 'page' : undefined"
                        @click="button.action?.()"
                    >
                        <span class="mobile-menu-link_index">{{ String(index + 1).padStart(2, '0') }}</span>
                        <span>{{ button.text }}</span>
                    </NuxtLink>
                </nav>

                <p class="mobile-menu-overlay_footer">Studentisches Programmkino in Dresden</p>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { useHeaderMenu } from '~/composables/navigation';

const route = useRoute();
const isMenuOpen = ref(false);
const mobileMenu = useTemplateRef<HTMLElement>('mobileMenu');
const menuTrigger = useTemplateRef<HTMLButtonElement>('menuTrigger');

const headerMenu = computed(() => {
    const menu = useHeaderMenu();
    return menu.value.filter(x => {
        return !(x.hide ?? false);
    });
});

useHead(() => ({
    bodyAttrs: {
        class: isMenuOpen.value ? 'mobile-menu-open' : undefined,
    },
}));

watch(() => route.fullPath, () => {
    closeMenu(false);
});

async function openMenu() {
    isMenuOpen.value = true;
    await nextTick();
    mobileMenu.value?.querySelector<HTMLElement>('button, a')?.focus();
}

function closeMenu(restoreFocus = true) {
    if (!isMenuOpen.value) return;
    isMenuOpen.value = false;
    if (restoreFocus) nextTick(() => menuTrigger.value?.focus());
}

function handleMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
    }

    if (event.key !== 'Tab' || !mobileMenu.value) return;

    const focusable = Array.from(
        mobileMenu.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
    }
}
</script>

<style scoped lang="scss">
.header__menu {
    overflow-x: auto;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    max-width: 100%;

    white-space: nowrap;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &_btn {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;

        width: 100%;

        text-align: left;

        &-container {
            position: relative;
        }

        &-wrapper {
            position: relative;

            &--has-children {
                &:hover {
                    .header__menu_btn-container {
                        border-bottom-right-radius: 0 !important;
                        border-bottom-left-radius: 0 !important;
                        background: $darkgray800 !important;
                    }

                    .header__menu_btn_children_menu {
                        visibility: visible;
                        opacity: 1;
                    }

                    .header__menu_btn_children_icon {
                        transform: rotate(180deg);
                    }
                }
            }
        }

        &_children {
            display: flex;

            &_icon {
                transform: rotate(0);
                width: 25px;
                transition: 0.3s;
            }

            &_menu {
                position: absolute;
                z-index: 10;
                top: calc(100% - 1px);
                left: 0;

                display: flex;
                flex-direction: column;
                gap: 8px;

                width: 100%;
                padding: 8px;
                border-bottom-right-radius: 8px;
                border-bottom-left-radius: 8px;

                visibility: hidden;
                opacity: 0;
                background: $darkgray900;

                transition: 0.3s;
            }
        }
    }
}

.mobile-menu-trigger,
.mobile-menu-overlay {
    display: none;
}

@include mobile {
    .header__menu {
        display: none;
    }

    .mobile-menu-trigger,
    .mobile-menu-close {
        cursor: pointer;

        display: grid;
        place-items: center;

        width: 44px;
        height: 44px;
        padding: 0;
        border: 1px solid $darkgray700;
        border-radius: 4px;

        color: $lightgray0;

        appearance: none;
        background: $darkgray875;

        &:focus-visible {
            outline: 2px solid $primary400;
            outline-offset: 3px;
        }

        :deep(svg) {
            width: 26px;
            height: 26px;
        }
    }

    .mobile-menu-overlay {
        position: fixed;
        z-index: 120;
        inset: 0;

        overflow-y: auto;
        display: flex;
        flex-direction: column;

        min-height: 100dvh;
        padding:
            max(1rem, env(safe-area-inset-top))
            max(1rem, env(safe-area-inset-right))
            max(1rem, env(safe-area-inset-bottom))
            max(1rem, env(safe-area-inset-left));

        color: $lightgray50;

        background:
            radial-gradient(circle at 10% 5%, rgb(196 48 31 / 22%) 0%, transparent 42%),
            $darkgray1000;

        &::before {
            pointer-events: none;
            content: '';

            position: absolute;
            inset: 0;

            opacity: 0.38;
            background-image: radial-gradient(rgb(244 240 234 / 10%) 1px, transparent 1.4px);
            background-size: 7px 7px;

            mask-image: linear-gradient(to bottom, black, transparent 72%);
        }

        &_header,
        &_footer,
        .mobile-menu-links {
            position: relative;
            z-index: 1;
        }

        &_header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            p {
                margin: 0;

                font-family: $displayFont;
                font-size: 1.5rem;
                text-transform: uppercase;
                letter-spacing: 0.03em;
            }
        }

        &_footer {
            margin: auto 0 0;
            padding-top: 1.5rem;
            font-size: 0.75rem;
            color: $lightgray300;
        }
    }

    .mobile-menu-close {
        background: transparent;
    }

    .mobile-menu-links {
        display: flex;
        flex-direction: column;
        margin-top: clamp(2rem, 8dvh, 4.5rem);
    }

    .mobile-menu-link {
        display: grid;
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
        align-items: baseline;

        min-width: 0;
        padding: 0.5rem 0;

        font-family: $displayFont;
        font-size: clamp(2.25rem, 11vw, 3.4rem);
        line-height: 0.95;
        color: $lightgray100;
        text-decoration: none;
        text-transform: uppercase;
        overflow-wrap: anywhere;

        &_index {
            font-family: $defaultFont;
            font-size: 0.65rem;
            font-weight: 700;
            line-height: 1;
            color: $secondary300;
        }

        &--active {
            color: $primary400;
        }

        &:focus-visible {
            border-radius: 2px;
            outline: 2px solid $primary400;
            outline-offset: 3px;
        }
    }

    .mobile-menu-enter-active,
    .mobile-menu-leave-active {
        transition: opacity 180ms ease-out, clip-path 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .mobile-menu-enter-from,
    .mobile-menu-leave-to {
        opacity: 0;
        clip-path: inset(0 0 100% 0);
    }
}

:global(body.mobile-menu-open) {
    overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
    .mobile-menu-enter-active,
    .mobile-menu-leave-active {
        transition-duration: 0.01ms;
    }
}
</style>
