import { getSessionUser } from '../../utils/auth'
export default defineEventHandler((event) => {
  const user = getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Потрібно увійти в акаунт' })
  return { user }
})
