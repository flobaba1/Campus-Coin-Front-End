export const AUTH_KEYS = {
  student: 'campuscoin.student.auth',
  admin: 'campuscoin.admin.auth',
}

function normalizeSessionResponse(response = {}) {
  const user = response.user || response.data || {}

  // Accept the token whether the backend returns it at the top level
  // or inside a nested user/data object.
  const token =
    response.token ||
    response.accessToken ||
    response.jwt ||
    response.access_token ||
    response.Authorization ||
    response.authToken ||
    user.token ||
    user.accessToken ||
    user.jwt ||
    user.access_token ||
    user.Authorization ||
    user.authToken ||
    null

  return {
    ...user,
    token,
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