import { randomUUID } from 'node:crypto'
import { hashPassword, issueSession, saveUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; email?: string; password?: string }>(event)
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password || ''
  if (!name || name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Вкажіть ім’я (мінімум 2 символи)' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Вкажіть коректну електронну адресу' })
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Пароль має містити щонайменше 8 символів' })
  const { salt, hash } = hashPassword(password)
  const user = { id: randomUUID(), name, email, salt, passwordHash: hash }
  if (!await saveUser(user)) throw createError({ statusCode: 409, statusMessage: 'Акаунт із цією поштою вже існує' })
  issueSession(event, user)
  return { user: { id: user.id, name: user.name, email: user.email } }
})
