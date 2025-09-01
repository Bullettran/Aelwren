<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "battle",
    data() {
        return {
            slots: Array(5).fill(null), // 5 слотов для юнитов игрока
            hand: [
                { id: 1, type: "unit", name: "Warrior", hp: 50, maxHp: 50, damage: 10, cost: { wood: 20 } },
                { id: 2, type: "spell", name: "Fireball", damage: 30, ability: { type: "aoe", damage: 10 }, cost: { water: 15 } },
            ], // Карточки в руке
            deck: [
                { id: 3, type: "unit", name: "Archer", hp: 30, maxHp: 30, damage: 15, cost: { wood: 15 } },
                { id: 4, type: "unit", name: "Knight", hp: 70, maxHp: 70, damage: 8, cost: { gold: 20 } },
            ], // Колода
            enemyWave: [], // Карточки врагов
            base: { hp: 100, maxHp: 100 }, // База
            waveNumber: 0, // Текущая волна
            isCombatActive: false, // Флаг активного боя
            resources: { wood: 100, gold: 50, water: 75 }, // Ресурсы
            draggedCard: null, // Хранит перетаскиваемую карточку
        };
    },
    methods: {
        drawCard() {
            if (this.deck.length > 0 && this.hand.length < 5) {
                const cardIndex = Math.floor(Math.random() * this.deck.length);
                const card = { ...this.deck[cardIndex] }; // Копия карточки
                this.hand.push(card);
            }
        },
        startWave() {
            this.waveNumber++;
            this.isCombatActive = true;
            // Генерация волны врагов
            this.enemyWave = [
                { id: `enemy-${this.waveNumber}-1`, type: "enemy", name: "Goblin", hp: 30, maxHp: 30, damage: 5 },
                { id: `enemy-${this.waveNumber}-2`, type: "enemy", name: "Orc", hp: 50, maxHp: 50, damage: 10, ability: { type: "dot", damage: 5 } },
            ].slice(0, Math.min(this.waveNumber + 1, 5)); // Увеличиваем число врагов с волнами
        },
        resolveCombat() {
            if (!this.isCombatActive) return;

            // Копии для безопасного обновления
            const slots = [...this.slots];
            const enemies = [...this.enemyWave];

            // Расчёт боя для каждой пары слотов
            slots.forEach((slot, index) => {
                if (slot && slot.type === "unit" && enemies[index]) {
                    const enemy = enemies[index];
                    // Применение урона
                    enemy.hp -= slot.damage || 0;
                    slot.hp -= enemy.damage || 0;

                    // Обработка способностей
                    if (slot.ability && slot.ability.type === "aoe") {
                        enemies.forEach(e => {
                            if (e) e.hp -= slot.ability.damage || 0;
                        });
                        slots[index] = null; // Заклинание одноразовое
                    }
                    if (enemy.ability && enemy.ability.type === "dot") {
                        slot.hp -= enemy.ability.damage || 0;
                    }

                    // Удаление погибших
                    if (enemy.hp <= 0) enemies[index] = null;
                    if (slot.hp <= 0) slots[index] = null;
                }
            });

            // Обновление состояния
            this.slots = slots;
            this.enemyWave = enemies.filter(e => e && e.hp > 0);

            // Урон базе, если враги остались
            if (this.enemyWave.length > 0) {
                const totalDamage = this.enemyWave.reduce((sum, e) => sum + (e.damage || 0), 0);
                this.base.hp = Math.max(0, this.base.hp - totalDamage);
            }

            // Проверка конца волны
            if (this.enemyWave.length === 0) {
                this.isCombatActive = false;
            }
        },
        onDragStart(event, card) {
            this.draggedCard = card;
            event.dataTransfer.setData("text/plain", JSON.stringify(card));
        },
        onDragOver(event, slotIndex) {
            if (this.slots[slotIndex] || !this.draggedCard) return;
            event.preventDefault(); // Разрешаем сброс
        },
        onDrop(event, slotIndex) {
            if (this.slots[slotIndex] || !this.draggedCard) return;
            const card = JSON.parse(event.dataTransfer.getData("text/plain"));
            const cost = card.cost || {};
            // Проверка ресурсов
            for (const [resource, amount] of Object.entries(cost)) {
                if (this.resources[resource] < amount) {
                    this.draggedCard = null;
                    return;
                }
            }
            // Списание ресурсов
            for (const [resource, amount] of Object.entries(cost)) {
                this.resources[resource] -= amount;
            }
            // Размещение карточки
            this.slots[slotIndex] = { ...card };
            this.hand = this.hand.filter(c => c.id !== card.id);
            this.draggedCard = null;
        },
        onDragEnd() {
            this.draggedCard = null;
        },
    },
});
</script>

<template>
    <div class="battle">
        <button @click="startWave" :disabled="isCombatActive">Start Wave</button>
        <button @click="resolveCombat" :disabled="!isCombatActive">Resolve Combat</button>
        <button @click="drawCard">Draw Card</button>
        <div class="battle__hand">
            <div
                v-for="card in hand"
                :key="card.id"
                class="card"
                draggable="true"
                @dragstart="onDragStart($event, card)"
                @dragend="onDragEnd"
            >
                {{ card.name }} (HP: {{ card.hp || '-' }}, ATK: {{ card.damage || 0 }})
                <div v-if="card.ability">Ability: {{ card.ability.type }}</div>
            </div>
        </div>
        <div class="battle__grid">
            <div
                v-for="(slot, index) in slots"
                :key="`slot-${index}`"
                class="battle__item"
                :class="{ 'battle__item--empty': !slot }"
                @dragover="onDragOver($event, index)"
                @drop="onDrop($event, index)"
            >
                <div v-if="slot" class="card" :class="{ 'card--damaged': slot.hp < slot.maxHp }">
                    {{ slot.name }} (HP: {{ slot.hp }}, ATK: {{ slot.damage || 0 }})
                    <div v-if="slot.ability">Ability: {{ slot.ability.type }}</div>
                </div>
                <div v-if="enemyWave[index]" class="enemy-card" :class="{ 'card--damaged': enemyWave[index].hp < enemyWave[index].maxHp }">
                    {{ enemyWave[index].name }} (HP: {{ enemyWave[index].hp }}, ATK: {{ enemyWave[index].damage }})
                    <div v-if="enemyWave[index].ability">Ability: {{ enemyWave[index].ability.type }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.battle {
    padding: 10px;
}
.battle__hand {
    display: flex;
    gap: 10px;
    margin: 10px 0;
}
.battle__grid {
    display: grid;
    grid-template-columns: repeat(5, 120px);
    gap: 10px;
    margin-top: 10px;
}
.battle__item {
    width: 120px;
    height: 150px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
}
.battle__item--empty {
    background: #f0f0f0;
}
.card, .enemy-card {
    width: 100%;
    padding: 5px;
    border: 1px solid #000;
    background: #fff;
    text-align: center;
    cursor: move;
    transition: transform 0.2s;
}
.enemy-card {
    background: #fdd;
}
.card--damaged {
    animation: shake 0.3s;
}
button {
    margin: 5px;
    padding: 5px 10px;
}
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
}
</style>