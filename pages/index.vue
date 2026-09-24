<script setup lang="ts">
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
import { useAuthStore } from "~/stores/auth";
const store = useProjectsStore();
const ui = useUiStore();
const auth = useAuthStore();
const todayLabel = computed(() =>
  new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  })
    .format(new Date())
    .toLocaleUpperCase("uk-UA"),
);
const period = ref("Останні 30 днів");
const periods = ["Останні 7 днів", "Останні 30 днів", "Цей квартал"];
const chartTooltip = ref<{
  label: string;
  value: number;
  x: number;
  y: number;
} | null>(null);
const chartLength = computed(() =>
  period.value === "Останні 7 днів"
    ? 7
    : period.value === "Цей квартал"
      ? 90
      : 30,
);
const chartData = computed(() => {
  const count = chartLength.value;
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - index - 1));
    const value =
      4 + ((index * 17 + count * 7 + Math.floor(index / 3) * 11) % 37);
    return {
      value,
      label: new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
      }).format(date),
      date,
    };
  });
});
const chartBars = computed(() =>
  chartData.value.map((point, i) => ({
    ...point,
    height: Math.max(8, (point.value / 45) * 100),
    highlighted: point.value >= 36,
    key: `${point.date.toISOString()}-${i}`,
  })),
);
const chartTicks = computed(() => {
  const indexes =
    chartLength.value === 7
      ? [0, 1, 2, 3, 4, 5, 6]
      : chartLength.value === 30
        ? [0, 7, 14, 21, 29]
        : [0, 14, 29, 44, 59, 74, 89];
  return indexes.map((index) => ({
    ...chartData.value[index],
    position:
      chartLength.value === 1 ? 50 : (index / (chartLength.value - 1)) * 100,
  }));
});
const query = `query DashboardProjects { projects { id name progress } }`;
const { data: graphData } = await useFetch("/api/graphql", {
  method: "POST",
  body: { query },
});
function showChartTooltip(index: number, event: MouseEvent | FocusEvent) {
  const target = event.currentTarget as HTMLElement;
  const chart = target.closest(".chart-main") as HTMLElement | null;
  if (!chart) return;
  const bar = target.getBoundingClientRect();
  const bounds = chart.getBoundingClientRect();
  chartTooltip.value = {
    ...chartBars.value[index],
    x: Math.max(
      42,
      Math.min(bounds.width - 42, bar.left - bounds.left + bar.width / 2),
    ),
    y: Math.max(4, bar.top - bounds.top - 44),
  };
}
function hideChartTooltip() {
  chartTooltip.value = null;
}
watch(period, hideChartTooltip);
const reminders = computed(() =>
  [
    { id: "t1", project: "Мобільний банкінг", due: "Сьогодні" },
    { id: "t2", project: "Мобільний банкінг", due: "Завтра" },
    { id: "t5", project: "Редизайн платформи", due: "Вчора" },
    { id: "t3", project: "Мобільний банкінг", due: "18 жов" },
  ]
    .map((reminder) => ({
      ...reminder,
      task: store.tasks.find((task) => task.id === reminder.id),
    }))
    .filter((item) => item.task),
);
function toggleReminder(id: string, status: string) {
  store.moveTask(id, status === "done" ? "todo" : "done");
}
</script>
<template>
  <div class="page-content dashboard-page">
    <section class="welcome-row">
      <div>
        <p class="eyebrow"><span class="sparkle">✳</span> {{ todayLabel }}</p>
        <h1>Доброго ранку, {{ auth.user?.name || "друже" }} <span>✦</span></h1>
        <p class="welcome-sub">
          Ось що відбувається у вашому робочому просторі сьогодні.
        </p>
      </div>
      <div class="welcome-actions">
        <button class="outline-button" @click="navigateTo('/projects')">
          <span>↗</span> Усі проєкти</button
        ><button class="primary-button" @click="navigateTo('/tasks')">
          ＋ <span>Нове завдання</span>
        </button>
      </div>
    </section>
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-top">
          <span>Активні проєкти</span><span class="stat-icon lavender">▧</span>
        </div>
        <div class="stat-value">
          {{ store.projects.length || 3
          }}<span class="stat-unit"> проєкти</span>
        </div>
        <div class="stat-foot">
          <span class="trend-up">↗ 12.5%</span
          ><span> проти минулого місяця</span>
        </div>
        <div class="mini-bars">
          <i
            v-for="n in 12"
            :key="n"
            :style="{ height: `${12 + ((n * 19) % 26)}px` }"
          />
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-top">
          <span>Завдання виконано</span><span class="stat-icon green">✓</span>
        </div>
        <div class="stat-value">
          {{ store.completedTasks || 24 }}<span class="stat-unit"> / 36</span>
        </div>
        <div class="stat-foot">
          <span class="trend-up">↗ 8.2%</span><span> цього тижня</span>
        </div>
        <div class="stat-progress"><i style="width: 67%" /></div>
        <div class="progress-caption">
          <span>Загальний прогрес</span><b>67%</b>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-top">
          <span>Команда онлайн</span><span class="stat-icon blue">♧</span>
        </div>
        <div class="stat-value">8<span class="stat-unit"> / 12</span></div>
        <div class="stat-foot"><span>учасників активні зараз</span></div>
        <div class="avatar-stack">
          <i>АМ</i><i>ІК</i><i>ТО</i><i>МП</i><span>+4</span
          ><em class="online-dot" />
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-top">
          <span>Найближчий дедлайн</span><span class="stat-icon peach">◷</span>
        </div>
        <div class="stat-value deadline-value">
          18 <span class="stat-unit">жовтня</span>
        </div>
        <div class="stat-foot"><span>Мобільний банкінг</span></div>
        <div class="deadline-row">
          <span class="deadline-chip">Через 9 днів</span><span>↗</span>
        </div>
      </article>
    </section>
    <section class="analytics-grid">
      <article class="panel activity-panel">
        <div class="panel-heading">
          <div>
            <h2>Активність команди</h2>
            <p>Виконані завдання протягом часу</p>
          </div>
          <select
            v-model="period"
            class="select-control"
            aria-label="Період активності"
          >
            <option v-for="item in periods" :key="item">{{ item }}</option>
          </select>
        </div>
        <div class="chart-wrap">
          <div class="chart-y">
            <span>45</span><span>35</span><span>25</span><span>15</span
            ><span>0</span>
          </div>
          <div class="chart-main">
            <div class="chart-grid"><i v-for="n in 5" :key="n" /></div>
            <div class="chart-bars">
              <button
                v-for="(bar, i) in chartBars"
                :key="bar.key"
                :class="['chart-bar', { highlighted: bar.highlighted }]"
                :style="{ height: `${bar.height}%` }"
                :aria-label="`${bar.label}: ${bar.value} завершених завдань`"
                @mouseenter="showChartTooltip(i, $event)"
                @mousemove="showChartTooltip(i, $event)"
                @mouseleave="hideChartTooltip"
                @focus="showChartTooltip(i, $event)"
                @blur="hideChartTooltip"
              >
                <span v-if="chartLength <= 7">{{ bar.label }}</span>
              </button>
            </div>
            <div
              class="chart-tooltip"
              v-if="chartTooltip"
              :style="{
                left: `${chartTooltip.x}px`,
                top: `${chartTooltip.y}px`,
              }"
              role="status"
            >
              <strong>{{ chartTooltip.label }}</strong
              ><span>{{ chartTooltip.value }} завершених завдань</span>
            </div>
            <div class="chart-x">
              <span
                v-for="tick in chartTicks"
                :key="tick.label"
                :style="{ left: `${tick.position}%` }"
                >{{ tick.label }}</span
              >
            </div>
          </div>
        </div>
        <div class="chart-legend">
          <i /> Завершені завдання <span>•</span>
          <b>{{ graphData ? "GraphQL live" : "Демо-дані" }}</b>
        </div>
      </article>
      <article class="panel deadline-panel">
        <div class="panel-heading">
          <div>
            <h2>Мої дедлайни</h2>
            <p>Завдання, що потребують уваги</p>
          </div>
          <NuxtLink to="/tasks" class="text-link">Усі <span>↗</span></NuxtLink>
        </div>
        <div class="deadline-list">
          <div v-for="item in reminders" :key="item.id" class="deadline-item">
            <button
              :class="[
                'task-check',
                item.task?.status === 'done' ? 'checked' : 'pending',
              ]"
              :aria-label="
                item.task?.status === 'done'
                  ? 'Повернути завдання'
                  : 'Позначити виконаним'
              "
              @click="toggleReminder(item.id, item.task?.status || 'todo')"
            >
              {{ item.task?.status === "done" ? "✓" : "" }}
            </button>
            <div>
              <strong>{{ item.task?.title }}</strong
              ><small>{{ item.project }}</small>
            </div>
            <span
              :class="
                item.task?.status === 'done'
                  ? 'due-done'
                  : item.due === 'Сьогодні'
                    ? 'due-today'
                    : item.due === 'Завтра'
                      ? 'due-tomorrow'
                      : 'due-later'
              "
              >{{ item.task?.status === "done" ? "Готово" : item.due }}</span
            >
          </div>
        </div>
      </article>
    </section>
    <section class="panel projects-panel">
      <div class="panel-heading">
        <div>
          <h2>Ваші проєкти</h2>
          <p>Стежте за прогресом та оновленнями</p>
        </div>
        <NuxtLink to="/projects" class="text-link"
          >Усі проєкти <span>↗</span></NuxtLink
        >
      </div>
      <div class="project-table">
        <div class="table-head">
          <span>ПРОЄКТ</span><span>УЧАСНИКИ</span><span>ПРОГРЕС</span
          ><span>ДЕДЛАЙН</span><span />
        </div>
        <div
          v-for="(project, i) in store.projects"
          :key="project.id"
          class="project-row"
        >
          <div class="project-name-cell">
            <span :class="['project-mark', project.color]">{{
              ["N", "L", "G"][i]
            }}</span>
            <div>
              <strong>{{ project.name }}</strong
              ><small>{{ project.client }}</small>
            </div>
          </div>
          <div class="member-stack">
            <i v-for="member in project.members.slice(0, 3)" :key="member">{{
              member
            }}</i
            ><span v-if="project.members.length > 2">+2</span>
          </div>
          <div class="table-progress">
            <div class="table-progress-track">
              <i :style="{ width: `${project.progress}%` }" />
            </div>
            <span>{{ project.progress }}%</span>
          </div>
          <div class="project-due">{{ project.due }}</div>
          <button
            class="row-menu"
            aria-label="Дії проєкту"
            @click="ui.open('project-menu', project.id)"
          >
            ···
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
