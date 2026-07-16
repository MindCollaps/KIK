<template>
    <ui-button
        :icon="right ? 'material-symbols:chevron-right' : 'material-symbols:chevron-left'"
        icon-width="30px"
        type="transparent"
        @click="$emit('click', $event)"
    />
</template>

<script lang="ts" setup>
defineProps({
    right: Boolean,
});

defineEmits({
    click(e: MouseEvent) {
        return true;
    },
});
</script>

<style scoped lang="scss">
    .button {
        padding: 0;
    }
</style>
