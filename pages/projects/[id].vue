<script setup lang="ts">
import { useProjectsStore } from "~/stores/projects";
import type { Project } from "~/types/project";

const route = useRoute();
const store = useProjectsStore();
if (!store.projects.length) {
  const { data } = await useFetch<Project[]>("/api/projects");
  if (data.value) store.projects = data.value;
}
const project = computed(() =>
  store.projects.find((item) => item.id === route.params.id),
);
const tasks = computed(() =>
  store.tasks.filter((task) => task.projectId === route.params.id),
);
watchEffect(() => {
  if (!project.value)
    showError({ statusCode: 404, statusMessage: "Проєкт не знайдено" });
  else useHead({ title: `${project.value.name} — Flowboard` });
});
</script>

<template>
  <div v-if="project" class="page-content subpage">
    <NuxtLink to="/projects" class="back-link">← Усі проєкти</NuxtLink>
    <div class="project-detail-heading">
      <span :class="['project-mark', project.color]">{{
        project.name[0]
      }}</span>
      <div>
        <p class="eyebrow">{{ project.client }}</p>
        <h1>{{ project.name }}</h1>
        <p class="welcome-sub">
          Дедлайн: {{ project.due }} · {{ project.tasks }} завдань
        </p>
      </div>
      <NuxtLink to="/tasks" class="primary-button"
        >Перейти до завдань ↗</NuxtLink
      >
    </div>
    <div class="project-detail-stats">
      <article class="panel">
        <span>Загальний прогрес</span><strong>{{ project.progress }}%</strong>
        <div class="table-progress-track">
          <i :style="{ width: `${project.progress}%` }" />
        </div>
      </article>
      <article class="panel">
        <span>Завдання</span><strong>{{ tasks.length || project.tasks }}</strong
        ><small>у командній дошці</small>
      </article>
      <article class="panel">
        <span>Учасники</span>
        <div class="member-stack">
          <i v-for="member in project.members" :key="member">{{ member }}</i>
        </div>
      </article>
    </div>
    <section class="panel project-task-panel">
      <div class="panel-heading">
        <div>
          <h2>Завдання проєкту</h2>
          <p>Поточний стан робіт у команді</p>
        </div>
        <NuxtLink to="/tasks" class="text-link">Відкрити дошку ↗</NuxtLink>
      </div>
      <div v-if="tasks.length" class="project-task-list">
        <div v-for="task in tasks" :key="task.id" class="project-task-row">
          <span
            :class="[
              'status-dot',
              task.status === 'done'
                ? 'green'
                : task.status === 'progress'
                  ? 'violet'
                  : 'gray',
            ]"
          /><strong>{{ task.title }}</strong
          ><span>{{ task.assignee }}</span
          ><span>{{
            task.status === "done"
              ? "Виконано"
              : task.status === "progress"
                ? "У процесі"
                : "До виконання"
          }}</span>
        </div>
      </div>
      <p v-else class="empty-state">Для цього проєкту поки немає завдань.</p>
    </section>
  </div>
</template>
