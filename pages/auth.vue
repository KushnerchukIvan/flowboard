<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const mode = ref<'login' | 'register'>(route.query.mode === 'register' ? 'register' : 'login')
const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function submit() {
  errorMessage.value = ''
  loading.value = true
  try {
    if (mode.value === 'register') await auth.register(name.value, email.value, password.value)
    else await auth.signIn(email.value, password.value)
    await navigateTo('/')
  } catch (error: unknown) {
    const requestError = error as { data?: { statusMessage?: string }; statusMessage?: string }
    errorMessage.value = requestError.data?.statusMessage || requestError.statusMessage || 'Не вдалося увійти. Спробуйте ще раз.'
  } finally { loading.value = false }
}
</script>

<template>
  <main class="auth-page">
    <NuxtLink to="/" class="brand auth-brand"><span class="brand-mark">f</span><span>flowboard</span><span class="brand-dot">.</span></NuxtLink>
    <section class="auth-card">
      <div class="auth-card-icon">✦</div>
      <p class="eyebrow">NORTHSTAR STUDIO · РОБОЧИЙ ПРОСТІР</p>
      <h1>{{ mode === 'register' ? 'Створіть акаунт' : 'З поверненням!' }}</h1>
      <p class="welcome-sub">{{ mode === 'register' ? 'Зареєструйтеся, щоб організувати роботу команди.' : 'Увійдіть, щоб продовжити роботу над проєктами.' }}</p>
      <form class="auth-form" @submit.prevent="submit">
        <label v-if="mode === 'register'">Ваше ім’я<input v-model="name" autocomplete="name" required minlength="2" placeholder="Анна Мельник"></label>
        <label>Електронна пошта<input v-model="email" type="email" autocomplete="email" required placeholder="name@example.com"></label>
        <label>Пароль<input v-model="password" type="password" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" required :minlength="mode === 'register' ? 8 : undefined" placeholder="Щонайменше 8 символів"></label>
        <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
        <button class="primary-button auth-submit" :disabled="loading">{{ loading ? 'Зачекайте…' : mode === 'register' ? 'Створити акаунт' : 'Увійти' }} <span>→</span></button>
      </form>
      <p class="auth-switch">{{ mode === 'register' ? 'Вже маєте акаунт?' : 'Ще не маєте акаунта?' }} <button type="button" @click="mode = mode === 'register' ? 'login' : 'register'; errorMessage = ''">{{ mode === 'register' ? 'Увійти' : 'Зареєструватися' }}</button></p>
      <p class="auth-security">JWT сесія зберігається в HttpOnly cookie. Паролі захищені хешуванням.</p>
    </section>
    <p class="auth-footer">Плануйте разом. Досягайте більшого.</p>
  </main>
</template>
