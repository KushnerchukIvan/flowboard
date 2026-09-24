<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const initials = computed(() => auth.user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'FB')
async function logout() { await auth.signOut(); await navigateTo('/auth') }
</script>
<template><div class="page-content subpage"><div class="subpage-heading"><div><p class="eyebrow">ОБЛІКОВИЙ ЗАПИС</p><h1>Налаштування</h1><p class="welcome-sub">Керуйте профілем та налаштуваннями доступу.</p></div></div><section class="panel settings-panel"><div class="settings-section"><div><h2>Профіль</h2><p>Інформація про ваш обліковий запис</p></div><div class="profile-preview"><span class="avatar large">{{ initials }}</span><div><strong>{{ auth.user?.name }}</strong><small>{{ auth.user?.email }}</small></div></div></div><div class="settings-section"><div><h2>Безпека</h2><p>Сесія захищена підписаним JWT у HttpOnly cookie.</p></div><div class="auth-controls"><span class="auth-status authenticated">● Ви увійшли в акаунт</span><small>Термін сесії — 7 днів. Пароль зберігається у вигляді хешу.</small><button class="outline-button" @click="logout">Вийти з акаунта</button></div></div></section></div></template>
