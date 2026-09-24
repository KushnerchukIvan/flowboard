import { defineStore } from "pinia";
import type { Project, Task, TaskStatus } from "~/types/project";

const demoProjects: Project[] = [
  {
    id: "p1",
    name: "Мобільний банкінг",
    client: "Northstar Finance",
    color: "violet",
    progress: 72,
    due: "18 жов",
    members: ["АМ", "ІК", "ТО"],
    tasks: 18,
  },
  {
    id: "p2",
    name: "Редизайн платформи",
    client: "Lumen Studio",
    color: "mint",
    progress: 48,
    due: "24 жов",
    members: ["ІК", "МП", "АМ"],
    tasks: 24,
  },
  {
    id: "p3",
    name: "Кабінет партнера",
    client: "Goodwell Health",
    color: "orange",
    progress: 91,
    due: "12 жов",
    members: ["ТО", "МП"],
    tasks: 12,
  },
];
const demoTasks: Task[] = [
  {
    id: "t1",
    title: "Підготувати сценарії онбордингу",
    projectId: "p1",
    status: "todo",
    priority: "high",
    assignee: "АМ",
    due: "Сьогодні",
    tag: "Дослідження",
  },
  {
    id: "t2",
    title: "Оновити компоненти картки",
    projectId: "p1",
    status: "todo",
    priority: "medium",
    assignee: "ІК",
    due: "Завтра",
    tag: "Дизайн-система",
  },
  {
    id: "t3",
    title: "Інтеграція платіжного API",
    projectId: "p1",
    status: "progress",
    priority: "high",
    assignee: "ТО",
    due: "18 жов",
    tag: "Розробка",
  },
  {
    id: "t4",
    title: "Мобільна навігація",
    projectId: "p2",
    status: "progress",
    priority: "medium",
    assignee: "МП",
    due: "20 жов",
    tag: "UI",
  },
  {
    id: "t5",
    title: "Перевірити контрастність",
    projectId: "p2",
    status: "done",
    priority: "low",
    assignee: "АМ",
    due: "Вчора",
    tag: "Доступність",
  },
  {
    id: "t6",
    title: "Підписання документів",
    projectId: "p3",
    status: "done",
    priority: "medium",
    assignee: "ТО",
    due: "10 жов",
    tag: "Розробка",
  },
];

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    projects: [] as Project[],
    tasks: demoTasks,
    loading: false,
    search: "",
    activeFilter: "Усі проєкти",
    draggingTaskId: "",
  }),
  getters: {
    filteredProjects: (state) =>
      state.projects.filter((project) =>
        `${project.name} ${project.client}`
          .toLowerCase()
          .includes(state.search.toLowerCase()),
      ),
    completedTasks: (state) =>
      state.tasks.filter((task) => task.status === "done").length,
  },
  actions: {
    async loadProjects() {
      if (this.projects.length) return;
      this.loading = true;
      try {
        this.projects = await $fetch<Project[]>("/api/projects");
      } catch {
        this.projects = demoProjects;
      } finally {
        this.loading = false;
      }
    },
    moveTask(id: string, status: TaskStatus) {
      const task = this.tasks.find((item) => item.id === id);
      if (task) task.status = status;
    },
    updateTask(id: string, updates: Partial<Omit<Task, "id">>) {
      const task = this.tasks.find((item) => item.id === id);
      if (task) Object.assign(task, updates);
    },
    startDraggingTask(id: string) {
      this.draggingTaskId = id;
    },
    clearDraggingTask() {
      this.draggingTaskId = "";
    },
    dropTask(status: TaskStatus) {
      if (this.draggingTaskId) this.moveTask(this.draggingTaskId, status);
      this.clearDraggingTask();
    },
    addTask(title: string) {
      this.tasks.unshift({
        id: `t${Date.now()}`,
        title,
        projectId: "p1",
        status: "todo",
        priority: "medium",
        assignee: "АМ",
        due: "Нова",
        tag: "Нове завдання",
      });
    },
    removeTask(id: string) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    },
    addProject(name: string, client: string) {
      this.projects.unshift({
        id: `p${Date.now()}`,
        name,
        client,
        color: "violet",
        progress: 0,
        due: "Не визначено",
        members: ["АМ"],
        tasks: 0,
      });
    },
    removeProject(id: string) {
      this.projects = this.projects.filter((project) => project.id !== id);
    },
  },
});
