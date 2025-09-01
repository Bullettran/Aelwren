<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Index",
});
</script>

<template>
    <div class="start">
        <div class="start__container container">
            <GameBattle/>
            <GameCastle/>
            <div class="start__down">
                <div class="start__wrap">
                    <GameBuild class="start__build"/>
                    <GameMagic class="start__magic"/>
                    <GameStats class="start__stats"/>
                </div>
                <GameResources/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "assets/scss/pages/index/styles";
</style>