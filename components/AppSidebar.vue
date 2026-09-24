<script setup lang="ts">
import { useUiStore } from "~/stores/ui";
const route = useRoute();
const ui = useUiStore();
const store = useProjectsStore();
const primary = [
  { label: "Огляд", to: "/", icon: "◫" },
  { label: "Мої завдання", to: "/tasks", icon: "☷", count: "8" },
  { label: "Команда", to: "/team", icon: "♧" },
];
</script>
<template>
  <aside class="sidebar">
    <NuxtLink to="/" class="brand"
      ><span class="brand-mark">f</span><span>flowboard</span
      ><span class="brand-dot">.</span></NuxtLink
    >
    <div class="workspace-switch">
      <div class="workspace-logo">N</div>
      <div><strong>Northstar Studio</strong><small>Робочий простір</small></div>
      <span class="chevron">⌄</span>
    </div>
    <p class="side-label">РОБОЧЕ МІСЦЕ</p>
    <nav class="side-nav">
      <NuxtLink
        v-for="item in primary"
        :key="item.to"
        :to="item.to"
        :class="['nav-link', { active: route.path === item.to }]"
        ><span class="nav-icon">{{ item.icon }}</span
        >{{ item.label
        }}<span v-if="item.count" class="nav-count">{{
          item.count
        }}</span></NuxtLink
      >
    </nav>
    <div class="projects-heading">
      <p class="side-label">ВАШІ ПРОЄКТИ</p>
      <button
        aria-label="Додати проєкт"
        class="icon-button"
        @click="ui.open('project')"
      >
        ＋
      </button>
    </div>
    <nav class="side-nav project-nav">
      <NuxtLink
        v-for="project in store.projects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="nav-link"
        ><i :class="['project-dot', project.color]" />{{
          project.name
        }}</NuxtLink
      >
    </nav>
    <div class="sidebar-bottom">
      <div class="upgrade-card">
        <div class="upgrade-icon">✦</div>
        <strong>Більше можливостей</strong>
        <p>Оновіть план, щоб розвивати команду без обмежень.</p>
        <button @click="ui.open('plan')">
          Переглянути плани <span>↗</span>
        </button>
      </div>
      <NuxtLink to="/settings" class="nav-link settings-link"
        ><span class="nav-icon">⚙</span>Налаштування</NuxtLink
      >
      <div class="sidebar-foot">
        <span class="online-dot" /> Усі системи працюють
      </div>
    </div>
  </aside>
</template>
