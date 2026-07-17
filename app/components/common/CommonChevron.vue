<template>
    <ui-button
        :icon="right ? 'material-symbols:chevron-right' : 'material-symbols:chevron-left'"
        icon-width="30px"
        type="link"
        @click="$emit('click', $event)"
    />
</template>

<script lang="ts" setup>
defineProps({
    right: Boolean,
});

defineEmits({
    click: (_e: MouseEvent) => true,
});
</script>

<style scoped lang="scss">
    .button {
        padding: 0;
    }
</style>
