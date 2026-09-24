import { buildSchema, graphql } from 'graphql'
const schema = buildSchema(`
  type Project { id: ID!, name: String!, client: String!, progress: Int!, due: String! }
  type Query { projects: [Project!]!, health: String! }
`)
const projects = [
  { id: 'p1', name: 'Мобільний банкінг', client: 'Northstar Finance', progress: 72, due: '18 жов' },
  { id: 'p2', name: 'Редизайн платформи', client: 'Lumen Studio', progress: 48, due: '24 жов' },
  { id: 'p3', name: 'Кабінет партнера', client: 'Goodwell Health', progress: 91, due: '12 жов' },
]
export default defineEventHandler(async (event) => {
  const { query, variables } = await readBody<{ query?: string; variables?: Record<string, unknown> }>(event)
  if (!query) throw createError({ statusCode: 400, statusMessage: 'GraphQL query is required' })
  const result = await graphql({ schema, source: query, rootValue: { projects: () => projects, health: () => 'ok' }, variableValues: variables })
  return result
})
