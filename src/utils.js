export const AUTH_KEYS = {
  student: 'campuscoin.student.auth',
  admin: 'campuscoin.admin.auth',
}

function normalizeSessionResponse(response = {}) {
  const token =
    response.token ||
    response.accessToken ||
    response.jwt ||
    response.access_token ||
    response.Authorization ||
    response.authToken ||
    null

  const user = response.user || response.data || {}

  return {
    token,
    ...user,
  }
}

export function setStudentSession(response) {
  localStorage.setItem(
    AUTH_KEYS.student,
    JSON.stringify(normalizeSessionResponse(response))
  )
}

export function setAdminSession(response) {
  localStorage.setItem(
    AUTH_KEYS.admin,
    JSON.stringify(normalizeSessionResponse(response))
  )
}

export function clearStudentSession() {
  localStorage.removeItem(AUTH_KEYS.student)
}

export function clearAdminSession() {
  localStorage.removeItem(AUTH_KEYS.admin)
}

export function isStudentAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEYS.student))
}

export function isAdminAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEYS.admin))
}

export function getStudentSession() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_KEYS.student) || 'null'
    )
  } catch {
    return null
  }
}

export function getAdminSession() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_KEYS.admin) || 'null'
    )
  } catch {
    return null
  }
}

export async function loadDemoUsers() {
  const response = await fetch('/data/demo-users.json', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Unable to load demo users')
  }

  return response.json()
}