import type { Project } from '~/types/project'
const projects: Project[] = [
  { id: 'p1', name: 'Мобільний банкінг', client: 'Northstar Finance', color: 'violet', progress: 72, due: '18 жов', members: ['АМ', 'ІК', 'ТО'], tasks: 18 },
  { id: 'p2', name: 'Редизайн платформи', client: 'Lumen Studio', color: 'mint', progress: 48, due: '24 жов', members: ['ІК', 'МП', 'АМ'], tasks: 24 },
  { id: 'p3', name: 'Кабінет партнера', client: 'Goodwell Health', color: 'orange', progress: 91, due: '12 жов', members: ['ТО', 'МП'], tasks: 12 },
]
export default defineEventHandler(() => projects)
