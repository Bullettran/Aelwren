<script lang="ts">
import { defineComponent } from "vue";

interface Unit {
    id: string;
    type: string;
    speed: number;
    attack: number;
    hp: number;
    col: number;
    row: number;
    hasMoved: boolean;
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
            currentPlayer: "player" as "player" | "enemy",
            playersUnits: [
                {
                    id: "warrior-standart",
                    type: "warrior",
                    speed: 2,
                    attack: 1,
                    hp: 5,
                    col: 2,
                    row: 4,
                    hasMoved: false,
                },
                {
                    id: "defender-standart",
                    type: "defender",
                    speed: 1,
                    attack: 0,
                    hp: 10,
                    col: 2,
                    row: 5,
                    hasMoved: false,
                },
                {
                    id: "mage-standart",
                    type: "mage",
                    speed: 1,
                    attack: 2,
                    hp: 2,
                    col: 1,
                    row: 1,
                    hasMoved: false,
                },
                {
                    id: "archer-standart",
                    type: "archer",
                    speed: 1,
                    attack: 3,
                    hp: 1,
                    col: 1,
                    row: 5,
                    hasMoved: false,
                },

            ] as Unit[],
            enemyUnits: [
                {
                    id: "zombie-standart",
                    type: "warrior",
                    speed: 2,
                    attack: 1,
                    hp: 5,
                    col: 8,
                    row: 4,
                    hasMoved: false,
                },
            ] as Unit[],
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
                        terrain: this.getRandomTerrain(),
                    });
                }
            }
            this.playersUnits.forEach((unit) => {
                const tileIndex = tiles.findIndex(t => t.row === unit.row && t.col === unit.col);

                if (tileIndex !== -1) {
                    if (tiles[tileIndex]) {
                        tiles[tileIndex].unit = { ...unit };
                    }
                }
            });
            this.enemyUnits.forEach((unit) => {
                const tileIndex = tiles.findIndex(t => t.row === unit.row && t.col === unit.col);

                if (tileIndex !== -1) {
                    if (tiles[tileIndex]) {
                        tiles[tileIndex].unit = { ...unit };
                    }
                }
            });
            this.gridItems = tiles;
        },

        isPlayerUnit(unit: Unit): boolean {
            return this.playersUnits.some(u => u.id === unit.id);
        },
        getRandomTerrain(): string | undefined {
            const terrains = ["grass", "water", "mountain", "forest"] as Array<string>;
            return terrains[Math.floor(Math.random() * terrains.length)];
        },

        selectTile(tile: GridItem): void {
            if (this.currentPlayer !== "player") return;

            if (this.selectedUnit?.id === tile.id) {
                this.selectedUnit = null;
                return;
            }
            // Если юнит уже выбран, пытаемся переместить
            if (this.selectedUnit) {
                this.moveUnit(tile);
            }
            // Если на клетке есть юнит игрока, выбираем его

            else if (tile.unit && this.isPlayerUnit(tile.unit) && !tile.unit.hasMoved) {
                this.selectedUnit = tile;
            }
        },
        moveUnit(targetTile: GridItem): void {
            if (!this.selectedUnit || targetTile.unit) return;

            // Проверяем, что клетка рядом
            const rowDiff = Math.abs(this.selectedUnit.row - targetTile.row);
            const colDiff = Math.abs(this.selectedUnit.col - targetTile.col);
            const maxMove = this.selectedUnit.unit?.speed || 1;

            // Можно двигаться на 1 клетку в любом направлении
            if (rowDiff <= maxMove && colDiff <= maxMove) {
                targetTile.unit = {
                    ...this.selectedUnit.unit!,
                    row: targetTile.row,
                    col: targetTile.col,
                    hasMoved: true,
                };
                // Обновляем позицию в массиве
                if (this.selectedUnit.unit) {
                    const unitArray = this.isPlayerUnit(this.selectedUnit.unit) ? this.playersUnits : this.enemyUnits;
                    const unitIndex = unitArray.findIndex(u => u.id === this.selectedUnit?.unit?.id);
                    if (unitIndex !== -1) {
                        unitArray[unitIndex] = { ...targetTile.unit };
                    }
                }
                this.selectedUnit.unit = null;
                this.selectedUnit = null;
            }
        },
        endTurn(): void {
            this.currentPlayer = "enemy";
            this.selectedUnit = null;
            // Сбрасываем флаги перемещения у пользователя
            this.gridItems.forEach(tile => {
                if (tile.unit && this.isPlayerUnit(tile.unit)) {
                    tile.unit.hasMoved = false;
                }
            });
            this.playersUnits.forEach(unit => unit.hasMoved = false);
            this.enemyTurn();
        },
        enemyTurn(): void {
            this.enemyUnits.forEach(enemy => {
                if (enemy.hp <= 0) return;

                const enemyTile = this.gridItems.find(t => t.unit?.id === enemy.id);
                if (!enemyTile) return;
                // Ближайший союзник
                let closestPlayer: GridItem | null = null;
                let minDistance = Infinity;

                this.gridItems.forEach(tile => {
                    if (tile.unit && this.isPlayerUnit(tile.unit)) {
                        const dist = Math.abs(tile.row - enemyTile.row) + Math.abs(tile.col - enemyTile.col);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestPlayer = tile;
                        }
                    }
                });

                if (!closestPlayer) return;

                // Пытаемся двигаться в сторону игрока
                const possibleMoves = this.getPossibleMoves(enemyTile, enemy.speed);
                let bestMove: GridItem | null = null;
                let bestMoveDistance = Infinity;

                possibleMoves.forEach(move => {
                    if (move.unit) return; // Не можем ходить в занятые клетки

                    const dist = Math.abs(move.row - closestPlayer!.row) +
                        Math.abs(move.col - closestPlayer!.col);

                    if (dist < bestMoveDistance) {
                        bestMoveDistance = dist;
                        bestMove = move;
                    }
                });
                if (bestMove) {
                    // @ts-ignore
                    bestMove.unit = {
                        ...enemy,
                        // @ts-ignore
                        row: bestMove.row,
                        // @ts-ignore
                        col: bestMove.col,
                        hasMoved: true,
                    };
                    enemyTile.unit = null;

                    // Обновляем позицию в массиве врагов
                    const enemyIndex = this.enemyUnits.findIndex(u => u.id === enemy.id);
                    if (enemyIndex !== -1) {
                        // @ts-ignore
                        this.enemyUnits[enemyIndex] = { ...bestMove.unit };
                    }
                }
            });
            // После хода врага снова ход игрока
            setTimeout(() => {
                this.currentPlayer = "player";
                this.selectedUnit = null;
                this.enemyUnits.forEach(unit => unit.hasMoved = false);
                this.gridItems.forEach(tile => {
                    if (tile.unit && !this.isPlayerUnit(tile.unit)) {
                        tile.unit.hasMoved = false;
                    }
                });
            }, 300);
        },
        getPossibleMoves(tile: GridItem, speed: number): GridItem[] {
            const moves: GridItem[] = [];
            const { row, col } = tile;

            for (let r = Math.max(1, row - speed); r <= Math.min(this.rows, row + speed); r++) {
                for (let c = Math.max(1, col - speed); c <= Math.min(this.cols, col + speed); c++) {
                    // Пропускаем текущую клетку
                    if (r === row && c === col) continue;

                    // Проверяем расстояние
                    const dist = Math.abs(r - row) + Math.abs(c - col);
                    if (dist <= speed) {
                        const targetTile = this.gridItems.find(t => t.row === r && t.col === c);
                        if (targetTile) {
                            moves.push(targetTile);
                        }
                    }
                }
            }

            return moves;
        },
    },
    mounted() {
        this.generateBattlefield();
    },
});
</script>

<template>
    <div class="battle">
        <div class="battle__battle-grid battle-grid">
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
          'battle-grid__movable': selectedUnit && Math.abs(item.row - selectedUnit.row) <= (selectedUnit.unit?.speed || 1) && Math.abs(item.col - selectedUnit.col) <= (selectedUnit.unit?.speed || 1) && !item.unit
        }
      ]"
                 @click="selectTile(item)">
                <div v-if="item.unit" class="test">
                    {{ item.unit.type === "warrior" ? "⚔️" : "?" }}
                    <span class="battle-grid__hp">{{ item.unit.hp }}❤️</span>
                </div>
            </div>
        </div>
        <div class="battle__actions">
            <div class="battle__buttons">
                <button class="battle__turn button" @click="endTurn()" style="color: #fff;" :disabled="currentPlayer !== 'player'">Закончить ход</button>
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>
@use "battle-grid";
</style>