<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "old-battle",
    data() {
        return {
            // Массив слотов для союзных юнитов, ограничен 10 слотами, инициализирован null
            slots: Array(10).fill(null),
            // Массив карточек в руке игрока, начинается с примеров
            hand: [
                // Пример карточки воина
                { id: 1, type: "warrior", name: "Warrior", hp: 50, maxHp: 50, damage: 10, cost: { wood: 20 } },
                // Пример карточки лучника
                { id: 2, type: "archer", name: "Archer", hp: 30, maxHp: 30, damage: 15, cost: { wood: 15 } },
                // Пример карточки мага
                { id: 3, type: "mage", name: "Mage", hp: 25, maxHp: 25, damage: 20, ability: { type: "aoe", damage: 10 }, cost: { water: 25 } },
            ],
            // Колода для новых карточек
            deck: [
                // Дополнительная карточка воина
                { id: 4, type: "warrior", name: "Warrior", hp: 50, maxHp: 50, damage: 10, cost: { wood: 20 } },
            ],
            // Массив врагов в текущей волне, ограничен 10
            enemyWave: [],
            // Состояние базы
            base: { hp: 100, maxHp: 100 },
            // Номер текущей волны
            waveNumber: 0,
            // Флаг активного боя
            isCombatActive: false,
            // Ресурсы игрока
            resources: { wood: 0, gold: 0, water: 0 },
            // Ходы подготовки (4-7 случайных ходов)
            prepTurns: Math.floor(Math.random() * 4) + 4,
            // Текущий ход подготовки
            currentPrepTurn: 0,
            // Перетаскиваемая карточка
            draggedCard: null,
        };
    },
    methods: {
        // Метод для вытягивания новой карточки из колоды
        drawCard() {
            // Проверка на наличие карточек в колоде и лимит руки
            if (this.deck.length > 0 && this.hand.length < 5) {
                // Выбор случайной карточки из колоды
                const cardIndex = Math.floor(Math.random() * this.deck.length);
                // Создание копии карточки
                const card = { ...this.deck[cardIndex] };
                // Добавление в руку
                this.hand.push(card);
            }
        },
        // Метод для запуска волны после подготовки
        startWave() {
            // Увеличение номера волны
            this.waveNumber++;
            // Активация боя
            this.isCombatActive = true;
            // Генерация врагов (до 10)
            this.enemyWave = [];
            // Цикл для создания врагов
            for (let i = 0; i < Math.min(this.waveNumber + 2, 10); i++) {
                // Создание примера врага (можно варьировать типы)
                this.enemyWave.push({ id: `enemy-${i}`, type: "enemy", name: "Goblin", hp: 30 + this.waveNumber * 5, maxHp: 30 + this.waveNumber * 5, damage: 5 + this.waveNumber });
            }
        },
        // Метод для разрешения боя
        resolveCombat() {
            // Проверка активного боя
            if (!this.isCombatActive) return;
            // Копии слотов и врагов для обновления
            const slots = [...this.slots];
            const enemies = [...this.enemyWave];
            // Цикл по слотам (до 10)
            for (let index = 0; index < 10; index++) {
                // Получение слота и врага
                const slot = slots[index];
                const enemy = enemies[index];
                // Проверка наличия юнита и врага
                if (slot && enemy) {
                    // Применение урона (воины/лучники бьют одного, маги - всех)
                    if (slot.type === "mage") {
                        // Маги бьют по всем врагам
                        enemies.forEach(e => { if (e) e.hp -= slot.damage || 0; });
                    } else {
                        // Обычный урон одному врагу
                        enemy.hp -= slot.damage || 0;
                    }
                    // Враг атакует юнита
                    slot.hp -= enemy.damage || 0;
                    // Удаление погибших
                    if (enemy.hp <= 0) enemies[index] = null;
                    if (slot.hp <= 0) slots[index] = null;
                }
            }
            // Обновление слотов
            this.slots = slots;
            // Фильтрация выживших врагов
            this.enemyWave = enemies.filter(e => e && e.hp > 0);
            // Урон базе от выживших врагов
            if (this.enemyWave.length > 0) {
                const totalDamage = this.enemyWave.reduce((sum, e) => sum + (e.damage || 0), 0);
                this.base.hp = Math.max(0, this.base.hp - totalDamage);
            }
            // Проверка конца волны
            if (this.enemyWave.length === 0) {
                this.isCombatActive = false;
            }
        },
        // Метод для начала хода подготовки
        prepTurn() {
            // Увеличение хода подготовки
            this.currentPrepTurn++;
            // Накопление ресурсов (пример: +10 к каждому ресурсу за ход)
            this.resources.wood += 10;
            this.resources.gold += 10;
            this.resources.water += 10;
            // Вытягивание карточки каждый ход
            this.drawCard();
            // Если ходы подготовки закончились, запуск волны
            if (this.currentPrepTurn >= this.prepTurns) {
                this.startWave();
            }
        },
        // Метод для начала перетаскивания
        onDragStart(event, card) {
            this.draggedCard = card;
            event.dataTransfer.setData("text/plain", JSON.stringify(card));
        },
        // Метод для разрешения перетаскивания над слотом
        onDragOver(event, slotIndex) {
            if (this.slots[slotIndex] || !this.draggedCard) return;
            event.preventDefault();
        },
        // Метод для сбрасывания карточки в слот
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
            // Размещение карточки (воины впереди - в первые слоты)
            this.slots[slotIndex] = { ...card };
            this.hand = this.hand.filter(c => c.id !== card.id);
            this.draggedCard = null;
        },
        // Метод для окончания перетаскивания
        onDragEnd() {
            this.draggedCard = null;
        },
    },
});
</script>

<template>
    <div class="battle">
        <!-- Кнопка для запуска хода подготовки -->
        <button @click="prepTurn" :disabled="isCombatActive || currentPrepTurn >= prepTurns">Prep Turn ({{ currentPrepTurn }} / {{ prepTurns }})</button>
        <!-- Кнопка для разрешения боя -->
        <button @click="resolveCombat" :disabled="!isCombatActive">Resolve Combat</button>
        <!-- Кнопка для вытягивания карточки -->
        <button @click="drawCard">Draw Card</button>
        <!-- Отображение ресурсов -->
        <div>Resources: Wood {{ resources.wood }}, Gold {{ resources.gold }}, Water {{ resources.water }}</div>
        <!-- Рука с карточками -->
        <div class="battle__hand">
            <div
                v-for="card in hand"
                :key="card.id"
                class="card"
                draggable="true"
                @dragstart="onDragStart($event, card)"
                @dragend="onDragEnd"
            >
                <!-- Отображение имени карточки -->
                {{ card.name }} (HP: {{ card.hp || '-' }}, ATK: {{ card.damage || 0 }})
                <!-- Отображение способности, если есть -->
                <div v-if="card.ability">Ability: {{ card.ability.type }}</div>
            </div>
        </div>
        <!-- Сетка поля боя -->
        <div class="battle__grid">
            <div
                v-for="(slot, index) in slots"
                :key="`slot-${index}`"
                class="battle__item"
                :class="{ 'battle__item--empty': !slot }"
                @dragover="onDragOver($event, index)"
                @drop="onDrop($event, index)"
            >
                <!-- Рендеринг компонента Unit для союзника, если слот занят -->
                <Unit v-if="slot" :unit="slot" :isEnemy="false" />
                <!-- Рендеринг компонента Unit для врага, если есть -->
                <Unit v-if="enemyWave[index]" :unit="enemyWave[index]" :isEnemy="true" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
/* Основной контейнер боя */
.battle {
    padding: 10px;
}
/* Контейнер руки */
.battle__hand {
    display: flex;
    gap: 10px;
    margin: 10px 0;
}
/* Сетка поля */
.battle__grid {
    display: grid;
    grid-template-columns: repeat(5, 120px); /* 5 колонок для 10 слотов, но можно адаптировать */
    gap: 10px;
    margin-top: 10px;
}
/* Элемент слота */
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
/* Пустой слот */
.battle__item--empty {
    background: #f0f0f0;
}
/* Карточка */
.card, .enemy-card {
    width: 100%;
    padding: 5px;
    border: 1px solid #000;
    background: #fff;
    text-align: center;
    cursor: move;
    transition: transform 0.2s;
}
/* Карточка врага */
.enemy-card {
    background: #fdd;
}
/* Анимация урона */
.card--damaged {
    animation: shake 0.3s;
}
/* Кнопки */
button {
    margin: 5px;
    padding: 5px 10px;
}
/* Ключевые кадры анимации */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
}
</style>