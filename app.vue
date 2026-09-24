<script setup lang="ts">
import { useProjectsStore } from '~/stores/projects'
const store = useProjectsStore()
onMounted(() => store.loadProjects())
</script>

<template>
  <NuxtRouteAnnouncer />
  <div v-if="$route.path === '/auth'" class="auth-shell">
    <NuxtPage />
  </div>
  <div v-else class="app-shell">
    <AppSidebar />
    <main class="main-area">
      <AppHeader />
      <NuxtPage />
    </main>
    <AppDialog />
  </div>
</template>
