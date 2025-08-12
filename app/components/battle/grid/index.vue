<script lang="ts">
import { defineComponent } from "vue";

interface GridItem {
    id: string;
    row: number;
    col: number;
    unit: string | null;
    terrain: string;
}

export default defineComponent({
    name: "Index",
    data(): { rows: number; cols: number; gridItems: GridItem[] } {
        return {
            rows: 6,
            cols: 8,
            gridItems: [],
        };
    },
    methods: {
        generateBattlefield(): void {
            const tiles: GridItem[] = [];
            for (let row = 1; row <= this.rows; row++) {
                for (let col = 1; col <= this.cols; col++) {
                    tiles.push({
                        id: `${row}-${col}`,
                        row,
                        col,
                        unit: null,
                        terrain: "",
                    });
                }
            }
            this.gridItems = tiles;
        },
        getRandomTerrain(row: number, col: number): string | undefined {
            const terrains = ["grass", "water", "mountain", "forest"] as Array<string>;
            return terrains[Math.floor(Math.random() * terrains.length)];
        },
        selectTile(tile: GridItem): void {
            console.log(tile);
        },
    },
    mounted() {
        this.generateBattlefield();
    },
});
</script>

<template>
    <div class="battle-grid">
        <div v-for="(item, index) in gridItems"
             :key="index"
             :class="[
                 `row-${item.row}`,
                 `col-${item.col}`,
                 `battle-grid__terrain--${item.terrain}`,
                 { 'battle-grid__player-side': item.col <= 3, 'battle-grid__enemy-side': item.col >= 6, 'battle-grid__occupied': item.unit, },
                  'battle-grid__item battle-grid__terrain'
                  ]"
             @click="selectTile(item)">
            <div class="test" v-if="index === 10"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "battle-grid";
</style>