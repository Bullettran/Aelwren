<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Unit",
    // Пропсы для компонента
    props: {
        // Объект юнита с данными
        unit: {
            type: Object,
            required: true,
        },
        // Флаг, является ли юнит врагом
        isEnemy: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<template>
    <!-- Контейнер юнита с классом в зависимости от типа -->
    <div :class="['unit', { 'unit--enemy': isEnemy, 'unit--damaged': unit.hp < unit.maxHp }]">
        <!-- Имя юнита -->
        <div>{{ unit.name }}</div>
        <!-- HP юнита -->
        <div>HP: {{ unit.hp }}</div>
        <!-- Урон юнита -->
        <div>ATK: {{ unit.damage || 0 }}</div>
        <!-- Способность, если есть -->
        <div v-if="unit.ability">Ability: {{ unit.ability.type }}</div>
    </div>
</template>

<style scoped lang="scss">
/* Основной класс юнита */
.unit {
    width: 100%;
    padding: 5px;
    border: 1px solid #000;
    background: #fff;
    text-align: center;
    transition: transform 0.2s;
}
/* Класс для врага */
.unit--enemy {
    background: #fdd;
}
/* Анимация для поврежденного юнита */
.unit--damaged {
    animation: shake 0.3s;
}
/* Ключевые кадры анимации */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
}
</style>