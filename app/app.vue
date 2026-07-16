<template>
    <nuxt-layout>
        <nuxt-page/>
    </nuxt-layout>
</template>

<script setup lang="ts">
await callOnce('site-config', () => loadSiteConfig());
</script>
