<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
const auth = useAuthStore()
const ui = useUiStore()
const initials = computed(() => auth.user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'FB')
</script>
<template>
  <header class="topbar"><div class="breadcrumbs"><span>Робоче місце</span><span class="crumb-sep">/</span><strong>{{ $route.path === '/' ? 'Огляд' : $route.path.slice(1).replace(/^./, (char) => char.toUpperCase()) }}</strong></div><div class="top-actions"><button class="search-trigger" @click="navigateTo('/search')"><span>⌕</span>Пошук <kbd>⌘ K</kbd></button><button class="header-icon" aria-label="Сповіщення" @click="ui.open('notifications')">♧<i /></button><div class="header-divider" /><button class="invite-button" @click="ui.open('invite')">＋ <span>Запросити</span></button><button class="avatar" :aria-label="auth.user?.name || 'Профіль'" @click="ui.open('profile')">{{ initials }}</button></div></header>
</template>
