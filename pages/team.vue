<script setup lang="ts">
import { useUiStore } from "~/stores/ui";
const ui = useUiStore();
const members = [
  {
    initials: "АМ",
    name: "Анна Мельник",
    role: "Product designer",
    color: "lavender",
  },
  {
    initials: "ІК",
    name: "Іван Коваль",
    role: "Frontend developer",
    color: "blue",
  },
  {
    initials: "ТО",
    name: "Тарас Онищенко",
    role: "Backend developer",
    color: "peach",
  },
  {
    initials: "МП",
    name: "Марія Петренко",
    role: "Project manager",
    color: "mint",
  },
];
</script>
<template>
  <div class="page-content subpage">
    <div class="subpage-heading">
      <div>
        <p class="eyebrow">РОБОЧИЙ ПРОСТІР</p>
        <h1>Команда</h1>
        <p class="welcome-sub">Люди, з якими ви створюєте класні речі.</p>
      </div>
      <button class="primary-button" @click="ui.open('invite')">
        ＋ Запросити учасника
      </button>
    </div>
    <div class="team-grid">
      <article
        v-for="person in members"
        :key="person.name"
        class="panel team-card"
      >
        <span :class="['team-avatar', person.color]">{{ person.initials }}</span
        ><span class="online-dot team-online" />
        <h2>{{ person.name }}</h2>
        <p>{{ person.role }}</p>
        <button class="outline-button" @click="ui.open('member', person.name)">
          Переглянути профіль
        </button>
      </article>
    </div>
  </div>
</template>
