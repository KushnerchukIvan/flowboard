<script setup lang="ts">
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
const store = useProjectsStore();
const ui = useUiStore();
</script>
<template>
  <div class="page-content subpage">
    <div class="subpage-heading">
      <div>
        <p class="eyebrow">КОМАНДНА РОБОТА</p>
        <h1>Ваші проєкти</h1>
        <p class="welcome-sub">
          {{ store.projects.length }} активні проєкти у вашому просторі.
        </p>
      </div>
      <button class="primary-button" @click="ui.open('project')">
        ＋ Створити проєкт
      </button>
    </div>
    <div class="project-cards">
      <article
        v-for="project in store.projects"
        :key="project.id"
        class="panel project-card"
      >
        <div class="project-card-top">
          <span :class="['project-mark', project.color]">{{
            project.name[0]
          }}</span
          ><button
            class="row-menu"
            aria-label="Керування проєктом"
            @click="ui.open('project-menu', project.id)"
          >
            ···
          </button>
        </div>
        <p>{{ project.client }}</p>
        <h2>
          <NuxtLink
            :to="`/projects/${project.id}`"
            class="project-title-link"
            >{{ project.name }}</NuxtLink
          >
        </h2>
        <div class="project-card-meta">
          <span>{{ project.tasks }} завдань</span
          ><span>Дедлайн {{ project.due }}</span>
        </div>
        <div class="table-progress">
          <div class="table-progress-track">
            <i :style="{ width: `${project.progress}%` }" />
          </div>
          <span>{{ project.progress }}%</span>
        </div>
        <div class="member-stack">
          Учасники
          <i v-for="member in project.members" :key="member">{{ member }}</i>
        </div>
      </article>
    </div>
  </div>
</template>
