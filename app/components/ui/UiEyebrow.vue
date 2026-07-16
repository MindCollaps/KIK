<template>
    <p class="ui-eyebrow">
        <slot />
    </p>
</template>

<style scoped lang="scss">
@use '~/scss/variables' as *;

.ui-eyebrow {
    margin: 0;

    font-size: 0.875rem;
    font-weight: 700;
    color: $lightgray400;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
</style>
