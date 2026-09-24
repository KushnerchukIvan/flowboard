<script setup lang="ts">
import { useProjectsStore } from '~/stores/projects'
import { useUiStore } from '~/stores/ui'
import type { Task, TaskStatus } from '~/types/project'

const store = useProjectsStore()
const ui = useUiStore()
const columns: { key: TaskStatus; title: string; tone: string }[] = [{ key: 'todo', title: 'До виконання', tone: 'gray' }, { key: 'progress', title: 'У процесі', tone: 'violet' }, { key: 'done', title: 'Виконано', tone: 'green' }]
const members = [{ initials: 'АМ', name: 'Анна Мельник' }, { initials: 'ІК', name: 'Іван Коваль' }, { initials: 'ТО', name: 'Тарас Онищенко' }, { initials: 'МП', name: 'Марія Петренко' }]
const newTask = ref('')
const editingTaskId = ref<string | null>(null)
const form = reactive({ title: '', description: '', projectId: 'p1', assignee: 'АМ', status: 'todo' as TaskStatus, priority: 'medium' as Task['priority'], dueDate: '', tag: '' })
const editingTask = computed(() => store.tasks.find((task) => task.id === editingTaskId.value))
function addTask(title = newTask.value.trim()) { if (title) { store.addTask(title); newTask.value = '' } }
function moveTask(id: string, event: Event) { store.moveTask(id, (event.target as HTMLSelectElement).value as TaskStatus) }
function startDrag(id: string, event: DragEvent) { store.startDraggingTask(id); if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', id) } }
function dropOnColumn(status: TaskStatus) { store.dropTask(status) }
function openEditor(task: Task) {
  editingTaskId.value = task.id
  Object.assign(form, { title: task.title, description: task.description || '', projectId: task.projectId, assignee: task.assignee, status: task.status, priority: task.priority, dueDate: task.dueDate || '', tag: task.tag })
}
function closeEditor() { editingTaskId.value = null }
function saveTask() {
  if (!editingTaskId.value || !form.title.trim()) return
  const due = form.dueDate ? new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' }).format(new Date(`${form.dueDate}T12:00:00`)) : 'Не визначено'
  store.updateTask(editingTaskId.value, { ...form, title: form.title.trim(), description: form.description.trim(), tag: form.tag.trim() || 'Без категорії', due, dueDate: form.dueDate })
  closeEditor()
}
function handleEscape(event: KeyboardEvent) { if (event.key === 'Escape') closeEditor() }
</script>
<template>
  <div class="page-content subpage">
    <div class="subpage-heading"><div><p class="eyebrow">ПЛАНУВАННЯ</p><h1>Мої завдання</h1><p class="welcome-sub">Усі важливі справи вашої команди — в одному місці.</p></div><form class="new-task-form" @submit.prevent="addTask()"><input v-model="newTask" placeholder="Назва нового завдання" aria-label="Назва нового завдання"><button class="primary-button">＋ Додати</button></form></div>
    <div class="board"><section v-for="column in columns" :key="column.key" :class="['board-column', { 'drop-target': store.draggingTaskId }]" @dragover.prevent @drop.prevent="dropOnColumn(column.key)">
      <div class="board-column-heading"><span :class="['status-dot', column.tone]"/><h2>{{ column.title }}</h2><span class="column-count">{{ store.tasks.filter(task => task.status === column.key).length }}</span><button class="row-menu" aria-label="Дії з колонкою" @click="ui.open('task-menu')">···</button></div>
      <article v-for="task in store.tasks.filter(item => item.status === column.key)" :key="task.id" class="task-card" :class="{ 'is-dragging': store.draggingTaskId === task.id }" draggable="true" @dragstart="startDrag(task.id, $event)" @dragend="store.clearDraggingTask()">
        <div class="task-card-top"><span :class="['task-tag', task.priority]">{{ task.tag }}</span><div class="task-card-actions"><span class="priority-mark">{{ task.priority === 'high' ? '↑' : task.priority === 'medium' ? '↗' : '↓' }}</span><button class="edit-task" type="button" :aria-label="`Редагувати завдання ${task.title}`" title="Редагувати завдання" @click.stop="openEditor(task)">✎</button><button class="delete-task" type="button" :aria-label="`Видалити завдання ${task.title}`" title="Видалити завдання" @click.stop="store.removeTask(task.id)">×</button></div></div>
        <h3>{{ task.title }}</h3><p v-if="task.description" class="task-description">{{ task.description }}</p>
        <div class="task-card-footer"><span class="assignee-avatar" :title="members.find(member => member.initials === task.assignee)?.name">{{ task.assignee }}</span><span>◷ {{ task.due }}</span><select :value="task.status" aria-label="Статус завдання" @change="moveTask(task.id, $event)"><option value="todo">До виконання</option><option value="progress">У процесі</option><option value="done">Виконано</option></select></div>
      </article><button class="add-card" @click="addTask('Нове завдання')">＋ Додати завдання</button>
    </section></div><p class="board-hint">Перетягуйте картки між статусами або змінюйте статус у меню. Натисніть ✎, щоб редагувати завдання.</p>
    <div v-if="editingTask" class="dialog-backdrop" @click.self="closeEditor" @keydown="handleEscape"><section class="dialog-card task-editor" role="dialog" aria-modal="true" aria-labelledby="task-editor-title"><button class="dialog-close" aria-label="Закрити" @click="closeEditor">×</button><p class="eyebrow">ЗАВДАННЯ</p><h2 id="task-editor-title">Редагувати завдання</h2><p class="dialog-description">Змініть деталі, виконавця або хід виконання.</p>
      <form class="dialog-form" @submit.prevent="saveTask">
        <label>Назва<input v-model="form.title" class="dialog-input" aria-label="Назва завдання" required maxlength="120"></label>
        <label>Опис<textarea v-model="form.description" class="dialog-input task-description-input" aria-label="Опис завдання" rows="3" maxlength="1000" placeholder="Додайте контекст або критерії готовності"/></label>
        <div class="task-form-grid"><label>Проєкт<select v-model="form.projectId" class="dialog-input" aria-label="Проєкт завдання"><option v-for="project in store.projects" :key="project.id" :value="project.id">{{ project.name }}</option></select></label><label>Виконавець<select v-model="form.assignee" class="dialog-input" aria-label="Виконавець завдання"><option v-for="member in members" :key="member.initials" :value="member.initials">{{ member.name }}</option></select></label></div>
        <div class="task-form-grid"><label>Статус<select v-model="form.status" class="dialog-input" aria-label="Статус у редакторі"><option value="todo">До виконання</option><option value="progress">У процесі</option><option value="done">Виконано</option></select></label><label>Пріоритет<select v-model="form.priority" class="dialog-input" aria-label="Пріоритет завдання"><option value="low">Низький</option><option value="medium">Середній</option><option value="high">Високий</option></select></label></div>
        <div class="task-form-grid"><label>Дедлайн<input v-model="form.dueDate" class="dialog-input" aria-label="Дедлайн завдання" type="date"></label><label>Категорія<input v-model="form.tag" class="dialog-input" aria-label="Категорія завдання" maxlength="40" placeholder="Наприклад, Розробка"></label></div>
        <div class="dialog-actions"><button type="button" class="outline-button" @click="closeEditor">Скасувати</button><button class="primary-button" type="submit">Зберегти зміни</button></div>
      </form>
    </section></div>
  </div>
</template>
