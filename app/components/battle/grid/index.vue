<script lang="ts">
import { defineComponent } from "vue";

interface Unit {
    id: string;
    type: string;
}

interface GridItem {
    id: string;
    row: number;
    col: number;
    unit: Unit | null;
    terrain: string | undefined;
}

export default defineComponent({
    name: "Index",
    data() {
        return {
            rows: 7,
            cols: 9,
            gridItems: [] as GridItem[],
            selectedUnit: null as GridItem | null,
            playerUnit: {
                id: 'player-1',
                type: 'warrior'
            } as Unit
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
                        unit: col === 1 && row === 4 ? this.playerUnit : null,
                        terrain: this.getRandomTerrain(),
                    });
                }
            }
            this.gridItems = tiles;
        },
        getRandomTerrain(): string | undefined {
            const terrains = ["grass", "water", "mountain", "forest"] as Array<string>;
            return terrains[Math.floor(Math.random() * terrains.length)];
        },

        selectTile(tile: GridItem): void {
            console.log(tile);
            // Если юнит уже выбран, пытаемся переместить
            if (this.selectedUnit) {
                this.moveUnit(tile);
            }
            // Если на клетке есть юнит, выбираем его
            else if (tile.unit) {
                this.selectedUnit = tile;
            }
        },
        moveUnit(targetTile: GridItem): void {
            if (!this.selectedUnit || targetTile.unit) return;

            // Проверяем, что клетка рядом
            const rowDiff = Math.abs(this.selectedUnit.row - targetTile.row);
            const colDiff = Math.abs(this.selectedUnit.col - targetTile.col);

            // Можно двигаться на 1 клетку в любом направлении
            if (rowDiff <= 1 && colDiff <= 1) {
                targetTile.unit = this.selectedUnit.unit;
                this.selectedUnit.unit = null;
                this.selectedUnit = null;
            }
        }
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
        'battle-grid__item',
        `battle-grid__terrain--${item.terrain}`,
        {
          'battle-grid__player-side': item.col <= 3,
          'battle-grid__enemy-side': item.col >= 7,
          'battle-grid__occupied': item.unit,
          'battle-grid__selected': item.id === selectedUnit?.id,
          'battle-grid__movable': selectedUnit && Math.abs(item.row - selectedUnit.row) <= 1 && Math.abs(item.col - selectedUnit.col) <= 1 && !item.unit
        }
      ]"
             @click="selectTile(item)">
            <div v-if="item.unit" class="test">
                {{ item.unit.type === 'warrior' ? '⚔️' : '?' }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "battle-grid";
</style>