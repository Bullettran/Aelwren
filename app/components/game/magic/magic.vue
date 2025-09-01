<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "magic",
});
</script>

<template>
    <div class="magic">
        <div class="magic__item"></div>
        <div class="magic__item"></div>
        <div class="magic__item"></div>
        <div class="magic__item"></div>
        <div class="magic__item"></div>
    </div>
</template>

<style scoped lang="scss">
@use "magic";
</style>