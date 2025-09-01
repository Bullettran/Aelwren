<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "build",
});
</script>

<template>
    <div class="build">
        <div class="build__grid">
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
            <div class="build__item build__item--empty"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "build";
</style>