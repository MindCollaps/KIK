<template>
    <form v-bind="$attrs" @submit.prevent="emit('submit', $event)">
        <slot/>
    </form>
</template>

<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
});

const emit = defineEmits<{
    submit: [event: SubmitEvent];
}>();
</script>
