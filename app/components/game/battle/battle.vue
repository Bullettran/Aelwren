<script lang="ts">
import { defineComponent } from "vue";

interface Ally {
    id: number;
    type: string;
    name: string;
    hp: number;
    maxHp: number;
    dmg: number;
    position: number; // Позиция в строю (0-9)
}

interface Enemy {
    id: number;
    type: string;
    name: string;
    hp: number;
    maxHp: number;
    dmg: number;
    position: number; // Позиция в строю (0-9)
}

interface BattleLog {
    turn: number,
    message: string,
    type: "attack" | "death" | "info"
}

export default defineComponent({
    name: "battle",
    data() {
        return {
            allies: [
                {
                    id: 1, type: "war", name: "Воин", hp: 5, maxHp: 5, dmg: 1, position: -1,
                },
                {
                    id: 2, type: "archer", name: "Лучник", hp: 2, maxHp: 2, dmg: 2, position: -1,
                },
            ],
            enemies: [
                {
                    id: 1, type: "war", name: "Зомбу", hp: 5, maxHp: 5, dmg: 1, position: 0,
                },
                {
                    id: 1, type: "war", name: "Зомбу", hp: 5, maxHp: 5, dmg: 1, position: 1,
                },
            ],
            isBattleActive: false,
            isChoiceActive: false,
            selectedPosition: null as number | null,
            allyPositions: Array(10).fill(null),
            enemyPositions: Array(10).fill(null),

            battleTurn: 0,
            battleLogs: [] as BattleLog[],
            currentAttacker: null as string | null,
            currentAction: null as string | null,
            battlePhase: "setup" as "setup" | "player" | "enemy" | "complete",
        };
    },
    methods: {
        // todo(kharal): интерфейс
        setAllyPosition(ally: any): void {
            if (this.selectedPosition === null) return;

            // Убираем юнита с предыдущей позиции (если был размещен)
            const previousPosition = this.allyPositions.findIndex(i => i?.id === ally.id);
            if (previousPosition !== -1) {
                this.allyPositions[previousPosition] = null;
            }

            // Размещаем на новой позиции
            this.allyPositions[this.selectedPosition] = { ...ally, position: this.selectedPosition };

            // Обновляем позицию в основном массиве
            const allyIndex = this.allies.findIndex(a => a.id === ally.id);
            if (allyIndex !== -1) {
                if (this.allies.length) {
                    // @ts-ignore
                    this.allies[allyIndex].position = this.selectedPosition;
                }
            }
            this.isChoiceActive = false;
            this.selectedPosition = null;
        },
        // todo(kharal): интерфейс
        onChoiceAlly(position: any): void {
            if (this.isBattleActive) return;

            if (this.allyPositions[position]) {
                // можно убрать или продать юнита
            } else {
                this.isChoiceActive = true;
                this.selectedPosition = position;
            }
        },
        getAvailableAllies(): Ally[] {
            // Юниты, которые еще не размещены
            return this.allies.filter(ally =>
                ally?.position === -1 || ally?.position === this.selectedPosition,
            );
        },

        setEnemiesPosition(): void {
            this.enemies.forEach(enemy => {
                if (enemy.position >= 0 && enemy.position < 10) {
                    this.enemyPositions[enemy.position] = enemy;
                }
            });
        },
        // Бой
        onTurnBattle(): void {
            this.isBattleActive = true;
            this.battleTurn = 1;
            this.battleLogs = [];
            this.addBattleLog(0, "Битва начинается!", "info");
        },

        nextTurn(): void {
            if (!this.isBattleActive) return;

            if (this.battlePhase === "player") {
                this.processPlayerTurn();
                this.battlePhase = "enemy";
                this.addBattleLog(this.battleTurn, "Ход врагов. Нажмите 'Следующий ход'", "info");
            } else if (this.battlePhase === "enemy") {
                this.processEnemyTurn();
                this.battleTurn++;
                this.battlePhase = "player";
                this.addBattleLog(this.battleTurn, `--- Ход ${this.battleTurn} --- Ваш ход`, "info");
            }
            if (this.checkBattleEnd()) {
                this.endBattle();
            }
        },

        processPlayerTurn(): void {
            if (this.battlePhase !== "player") return;

            this.addBattleLog(this.battleTurn, "Союзники атакуют!", "info");

            // Союзники атакуют врагов
            this.allyPositions.forEach((ally, position) => {
                if (ally && ally.hp > 0) {
                    this.allyAttack(ally, position);
                }
            });
        },

        processEnemyTurn(): void {
            this.addBattleLog(this.battleTurn, "Враги атакуют!", "info");

            // Враги атакуют союзников
            this.enemyPositions.forEach((enemy, position) => {
                if (enemy && enemy.hp > 0) {
                    this.enemyAttack(enemy, position);
                }
            });

            this.battlePhase = "player";
        },

        allyAttack(ally: Ally, allyPosition: number): void {
            // Ищем ближайшего врага слева
            for (let i = allyPosition; i >= 0; i--) {
                const enemy = this.enemyPositions[i];
                if (enemy && enemy.hp > 0) {
                    this.performAttack(ally, enemy, i, "ally");
                    return;
                }
            }

            // Если не нашли слева, ищем справа
            for (let i = allyPosition + 1; i < 10; i++) {
                const enemy = this.enemyPositions[i];
                if (enemy && enemy.hp > 0) {
                    this.performAttack(ally, enemy, i, "ally");
                    return;
                }
            }

            this.addBattleLog(this.battleTurn, `${ally.name} не нашел цели для атаки`, "info");
        },

        enemyAttack(enemy: Enemy, enemyPosition: number): void {
            // Ищем ближайшего союзника слева
            for (let i = enemyPosition; i >= 0; i--) {
                const ally = this.allyPositions[i];
                if (ally && ally.hp > 0) {
                    this.performAttack(enemy, ally, i, "enemy");
                    return;
                }
            }

            // Если не нашли слева, ищем справа
            for (let i = enemyPosition + 1; i < 10; i++) {
                const ally = this.allyPositions[i];
                if (ally && ally.hp > 0) {
                    this.performAttack(enemy, ally, i, "enemy");
                    return;
                }
            }

            this.addBattleLog(this.battleTurn, `${enemy.name} не нашел цели для атаки`, "info");
        },

        performAttack(attacker: any, defender: any, defenderPosition: number, attackerType: string): void {
            const oldHp = defender.hp;
            defender.hp = Math.max(0, defender.hp - attacker.dmg);

            this.addBattleLog(
                this.battleTurn,
                `${attacker.name} атакует ${defender.name} и наносит ${attacker.dmg} урона! ` +
                `(${oldHp} → ${defender.hp} HP)`,
                "attack",
            );

            // Проверяем смерть защитника
            if (defender.hp <= 0) {
                this.addBattleLog(
                    this.battleTurn,
                    `💀 ${defender.name} погибает!`,
                    "death",
                );

                // Убираем мертвого юнита с поля боя
                if (attackerType === "ally") {
                    this.enemyPositions[defenderPosition] = null;
                } else {
                    this.allyPositions[defenderPosition] = null;
                }
            }
        },

        checkBattleEnd(): boolean {
            const alliesAlive = this.allyPositions.some(ally => ally !== null && ally.hp > 0);
            const enemiesAlive = this.enemyPositions.some(enemy => enemy !== null && enemy.hp > 0);

            return !alliesAlive || !enemiesAlive;
        },

        endBattle(): void {
            this.battlePhase = "complete";

            const alliesAlive = this.allyPositions.some(ally => ally !== null && ally.hp > 0);
            const enemiesAlive = this.enemyPositions.some(enemy => enemy !== null && enemy.hp > 0);

            if (alliesAlive && !enemiesAlive) {
                this.addBattleLog(this.battleTurn, "🎉 Победа! Все враги повержены!", "info");
            } else if (!alliesAlive && enemiesAlive) {
                this.addBattleLog(this.battleTurn, "💀 Поражение! Все союзники погибли!", "info");
            } else {
                this.addBattleLog(this.battleTurn, "⚔️ Ничья!", "info");
            }

            this.isBattleActive = false;
        },

        addBattleLog(turn: number, message: string, type: "attack" | "death" | "info"): void {
            this.battleLogs.unshift({
                turn,
                message,
                type,
            });

            // Ограничиваем количество записей в логе
            if (this.battleLogs.length > 20) {
                this.battleLogs.pop();
            }
        },
    },
    mounted(): any {
        this.setEnemiesPosition();
    },
});
</script>

<template>
    <div class="battle">
        <div class="battle__grid">
            <div class="battle__enemies">
                <div
                    v-for="(enemy, index) in enemyPositions"
                    :key="'enemy-' + index"
                    class="battle__position battle__position--enemy"
                >
                    <div v-if="enemy" class="battle__unit battle__unit--enemy">
                        <div class="battle__unit-name">{{ enemy.name }}</div>
                        <div class="battle__unit-stats">
                            HP: {{ enemy.hp }} | ATK: {{ enemy.dmg }}
                        </div>
                        <div class="battle__unit-position">Поз. {{ index }}</div>
                    </div>
                    <div v-else class="battle__position-empty">
                        Враг [{{ index }}]
                    </div>
                </div>
            </div>
            <div class="battle__allies">
                <div class="battle__position battle__position--ally"
                     v-for="(ally, index) in allyPositions"
                     :key="`ally-${index}`"
                     @click="onChoiceAlly(index)"
                >
                    <div class="battle__unit battle__unit--ally" v-if="ally">
                        <div class="battle__unit-name">{{ ally.name }}</div>
                        <div class="battle__unit-stats">
                            HP: {{ ally.hp }} | ATK: {{ ally.dmg }}
                        </div>
                        <div class="battle__unit-position">Поз. {{ index }}</div>
                    </div>
                    <div v-else class="battle__position-empty">
                        Союзник [{{ index }}]
                    </div>
                </div>
            </div>
            <div class="battle__units" v-if="isChoiceActive">
                <div class="battle__unit"
                     v-for="(ally, index) in getAvailableAllies()"
                     :key="index"
                     @click="setAllyPosition(ally)"
                >
                    <div class="battle__hp">HP:{{ ally.maxHp }}</div>
                    <div class="battle__atk">ATK:{{ ally.dmg }}</div>
                    <div class="battle__name">NAME:{{ ally.name }}</div>
                </div>
            </div>
        </div>
        <div class="battle__action">
            <button @click="onTurnBattle">Начать бой</button>
            <button @click="nextTurn">Ход</button>
        </div>
        <div class="battle__log" v-if="battleLogs.length > 0">
            <h3>Журнал битвы:</h3>
            <div class="battle__log-entries">
                <div
                    v-for="(log, index) in battleLogs"
                    :key="index"
                    class="battle__log-entry"
                    :class="'battle__log-entry--' + log.type"
                >
                    <span class="battle__log-turn">[Ход {{ log.turn }}]</span>
                    {{ log.message }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "battle";
</style>