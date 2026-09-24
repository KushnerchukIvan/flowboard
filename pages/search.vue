<script setup lang="ts">
import { useProjectsStore } from '~/stores/projects'
const store = useProjectsStore()
onMounted(() => { document.querySelector<HTMLInputElement>('.search-page-input')?.focus() })
</script>
<template><div class="page-content subpage"><div class="subpage-heading"><div><p class="eyebrow">ШВИДКИЙ ДОСТУП</p><h1>Пошук</h1><p class="welcome-sub">Знайдіть потрібний проєкт у робочому просторі.</p></div></div><div class="search-page-box"><span>⌕</span><input v-model="store.search" class="search-page-input" placeholder="Назва проєкту або клієнт…"><kbd>ESC</kbd></div><div class="project-cards search-results"><article v-for="project in store.filteredProjects" :key="project.id" class="panel project-card"><div class="project-card-top"><span :class="['project-mark', project.color]">{{ project.name[0] }}</span></div><p>{{ project.client }}</p><h2>{{ project.name }}</h2><div class="table-progress"><div class="table-progress-track"><i :style="{ width: `${project.progress}%` }" /></div><span>{{ project.progress }}%</span></div></article><p v-if="!store.filteredProjects.length" class="empty-state">Проєктів не знайдено. Спробуйте інший запит.</p></div></div></template>
