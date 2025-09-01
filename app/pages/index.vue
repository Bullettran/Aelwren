<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Index",
});
</script>

<template>
    <div class="start">
        <div class="start__container container">
            <GameBuild/>
            <client-only>
                <div class="game-container"></div>
            </client-only>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "assets/scss/pages/index/styles";
</style>