import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

export interface UserRecord { id: string; name: string; email: string; passwordHash: string; salt: string }
export interface SessionUser { id: string; name: string; email: string }
interface JwtPayload extends SessionUser { iat: number; exp: number }

const globalUsers = globalThis as typeof globalThis & { __flowboardUsers?: Map<string, UserRecord>; __flowboardUsersLoaded?: boolean }
export const users = globalUsers.__flowboardUsers ??= new Map<string, UserRecord>()
const usersFile = join(process.cwd(), '.data', 'flowboard-users.json')
const cookieName = 'flowboard_session'
const lifetime = 60 * 60 * 24 * 7

async function loadUsers() {
  if (globalUsers.__flowboardUsersLoaded) return
  try {
    const records = JSON.parse(await readFile(usersFile, 'utf8')) as UserRecord[]
    for (const user of records) users.set(user.email, user)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  globalUsers.__flowboardUsersLoaded = true
}

export async function findUser(email: string) {
  await loadUsers()
  return users.get(email)
}

export async function saveUser(user: UserRecord) {
  await loadUsers()
  if (users.has(user.email)) return false
  users.set(user.email, user)
  await mkdir(join(process.cwd(), '.data'), { recursive: true })
  const temporaryFile = `${usersFile}.tmp`
  await writeFile(temporaryFile, JSON.stringify([...users.values()], null, 2), { mode: 0o600 })
  await rename(temporaryFile, usersFile)
  return true
}

function secret(event: H3Event) {
  const config = useRuntimeConfig(event)
  if (config.jwtSecret) return String(config.jwtSecret)
  if (process.env.NODE_ENV === 'production') throw createError({ statusCode: 500, statusMessage: 'JWT_SECRET must be configured' })
  return 'flowboard-local-development-secret-change-before-deploying'
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') }
}

export function passwordMatches(password: string, user: UserRecord) {
  const candidate = Buffer.from(hashPassword(password, user.salt).hash, 'hex')
  const expected = Buffer.from(user.passwordHash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function issueSession(event: H3Event, user: UserRecord) {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload: JwtPayload = { id: user.id, name: user.name, email: user.email, iat: now, exp: now + lifetime }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const unsigned = `${header}.${encodedPayload}`
  const signature = createHmac('sha256', secret(event)).update(unsigned).digest('base64url')
  setCookie(event, cookieName, `${unsigned}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: lifetime })
}

export function clearFlowboardSession(event: H3Event) { deleteCookie(event, cookieName, { path: '/' }) }

export function getSessionUser(event: H3Event): SessionUser | null {
  const token = getCookie(event, cookieName)
  if (!token) return null
  try {
    const [header, payload, signature, extra] = token.split('.')
    if (!header || !payload || !signature || extra) return null
    const expected = createHmac('sha256', secret(event)).update(`${header}.${payload}`).digest()
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as JwtPayload
    if (!decoded.id || !decoded.email || !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) return null
    return { id: decoded.id, name: decoded.name, email: decoded.email }
  } catch { return null }
}
