import { findUser, issueSession, passwordMatches } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body.email?.trim().toLowerCase()
  const user = email ? await findUser(email) : undefined
  if (!user || !body.password || !passwordMatches(body.password, user)) {
    throw createError({ statusCode: 401, statusMessage: 'Неправильна пошта або пароль' })
  }
  issueSession(event, user)
  return { user: { id: user.id, name: user.name, email: user.email } }
})
