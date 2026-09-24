<script setup lang="ts">
import { useProjectsStore } from '~/stores/projects'
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const ui = useUiStore()
const projects = useProjectsStore()
const auth = useAuthStore()
const input = ref('')
const secondary = ref('')
const sending = ref(false)
const initials = computed(() => auth.user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'FB')
const activeProject = computed(() => projects.projects.find((project) => project.id === ui.target))
const headings = {
  invite: ['Запросити до команди', 'Надішліть запрошення колезі долучитися до Northstar Studio.'],
  project: ['Новий проєкт', 'Створіть проєкт і додайте його до робочого простору.'],
  notifications: ['Сповіщення', 'Останні оновлення вашої команди.'],
  profile: ['Ваш профіль', 'Налаштування облікового запису.'],
  plan: ['Плани Flowboard', 'Демо-плани для вашого робочого простору.'],
  member: ['Учасник команди', 'Інформація про профіль учасника.'],
  'project-menu': ['Керування проєктом', 'Дії для вибраного проєкту.'],
  'task-menu': ['Завдання', 'Швидкі дії з дошкою завдань.'],
}
const heading = computed(() => ui.dialog ? headings[ui.dialog] : ['', ''])

function submit() {
  if (ui.dialog === 'project') {
    if (!input.value.trim() || !secondary.value.trim()) return
    projects.addProject(input.value.trim(), secondary.value.trim())
    ui.close()
    ui.notify('Проєкт створено')
  } else if (ui.dialog === 'invite') {
    if (!input.value.trim() || !input.value.includes('@')) return
    sending.value = true
    window.setTimeout(() => {
      sending.value = false
      ui.close()
      ui.notify(`Запрошення надіслано на ${input.value}`)
    }, 350)
  }
}

function removeProject() {
  if (activeProject.value) {
    projects.removeProject(activeProject.value.id)
    ui.close()
    ui.notify('Проєкт видалено')
  }
}

function markNotificationsRead() {
  ui.close()
  ui.notify('Усі сповіщення позначено прочитаними')
}
async function logout() {
  await auth.signOut()
  ui.close()
  await navigateTo('/auth')
}

watch(() => ui.dialog, (kind) => {
  input.value = ''
  secondary.value = ''
  if (kind && ['invite', 'project'].includes(kind)) nextTick(() => document.querySelector<HTMLInputElement>('.dialog-input')?.focus())
})

function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') ui.close() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="ui.dialog" class="dialog-backdrop" @click.self="ui.close()">
        <section class="dialog-card" role="dialog" aria-modal="true" :aria-label="heading[0]">
          <button class="dialog-close" aria-label="Закрити" @click="ui.close()">×</button>
          <p class="eyebrow">FLOWBOARD · NORTHSTAR STUDIO</p>
          <h2>{{ heading[0] }}</h2>
          <p class="dialog-description">{{ heading[1] }}</p>

          <form v-if="ui.dialog === 'project'" class="dialog-form" @submit.prevent="submit">
            <label>Назва проєкту<input v-model="input" class="dialog-input" required placeholder="Наприклад, Мобільний застосунок"></label>
            <label>Клієнт або команда<input v-model="secondary" class="dialog-input" required placeholder="Назва клієнта"></label>
            <div class="dialog-actions"><button type="button" class="outline-button" @click="ui.close()">Скасувати</button><button class="primary-button">Створити проєкт</button></div>
          </form>

          <form v-else-if="ui.dialog === 'invite'" class="dialog-form" @submit.prevent="submit">
            <label>Email учасника<input v-model="input" class="dialog-input" type="email" required placeholder="name@example.com"></label>
            <label>Роль<select v-model="secondary" class="dialog-input"><option value="">Учасник</option><option>Адміністратор</option><option>Гість</option></select></label>
            <div class="dialog-actions"><button type="button" class="outline-button" @click="ui.close()">Скасувати</button><button class="primary-button" :disabled="sending">{{ sending ? 'Надсилаємо…' : 'Надіслати запрошення' }}</button></div>
          </form>

          <div v-else-if="ui.dialog === 'notifications'" class="dialog-list">
            <div class="dialog-list-item"><span class="notification-icon violet">✓</span><div><strong>Іван завершив дизайн-ревʼю</strong><small>Мобільний банкінг · 18 хв тому</small></div></div>
            <div class="dialog-list-item"><span class="notification-icon green">＋</span><div><strong>Нове завдання у вашому проєкті</strong><small>Редизайн платформи · 1 год тому</small></div></div>
            <div class="dialog-list-item"><span class="notification-icon peach">◷</span><div><strong>Наближається дедлайн</strong><small>Сценарії онбордингу · сьогодні</small></div></div>
            <div class="dialog-actions"><button class="primary-button" @click="markNotificationsRead">Позначити все прочитаним</button></div>
          </div>

          <div v-else-if="ui.dialog === 'profile'" class="profile-dialog-content">
            <div class="profile-preview"><span class="avatar large">{{ initials }}</span><div><strong>{{ auth.user?.name }}</strong><small>{{ auth.user?.email }}</small></div></div>
            <NuxtLink class="outline-button" to="/settings" @click="ui.close()">Відкрити налаштування</NuxtLink>
            <button class="outline-button" @click="logout">Вийти з акаунта</button>
          </div>

          <div v-else-if="ui.dialog === 'plan'" class="plan-options"><article><strong>Starter</strong><b>Безкоштовно</b><small>Для невеликих команд і персональних проєктів</small></article><article><strong>Team</strong><b>₴299 <small>/ користувач / місяць</small></b><small>Необмежені проєкти та розширена аналітика</small></article><button class="primary-button" @click="ui.close(); ui.notify('Дякуємо за інтерес до Flowboard!')">Обрати Team</button></div>

          <div v-else-if="ui.dialog === 'member'" class="member-dialog-content"><span class="team-avatar lavender">{{ ui.target.slice(0, 2) }}</span><div><strong>{{ ui.target }}</strong><small>Учасник Northstar Studio</small></div><NuxtLink class="outline-button" to="/team" @click="ui.close()">Переглянути команду</NuxtLink></div>

          <div v-else-if="ui.dialog === 'project-menu'" class="dialog-list"><div v-if="activeProject" class="project-detail"><span :class="['project-mark', activeProject.color]">{{ activeProject.name[0] }}</span><div><strong>{{ activeProject.name }}</strong><small>{{ activeProject.client }} · {{ activeProject.progress }}% готово</small></div></div><div class="dialog-actions"><button v-if="activeProject" class="primary-button" @click="navigateTo(`/projects/${activeProject.id}`); ui.close()">Відкрити проєкт</button><button v-if="activeProject" class="outline-button danger-button" @click="removeProject">Видалити проєкт</button></div></div>

          <div v-else-if="ui.dialog === 'task-menu'" class="dialog-list"><p>Керуйте завданнями на дошці: змінюйте статус у картці або створіть нове.</p><div class="dialog-actions"><button class="outline-button" @click="ui.close(); navigateTo('/tasks')">Перейти до завдань</button><button class="primary-button" @click="projects.addTask('Нове завдання'); ui.close(); navigateTo('/tasks'); ui.notify('Завдання створено')">＋ Нове завдання</button></div></div>
        </section>
      </div>
    </Transition>
    <Transition name="toast"><div v-if="ui.toast" class="toast-message app-toast">{{ ui.toast }}</div></Transition>
  </Teleport>
</template>
