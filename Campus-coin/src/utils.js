export const AUTH_KEYS = {
  student: 'campuscoin.student.auth',
  admin: 'campuscoin.admin.auth',
}

export function setStudentSession(user) {
  localStorage.setItem(AUTH_KEYS.student, JSON.stringify({ email: user.email, name: user.name, role: user.role }))
}

export function setAdminSession(user) {
  localStorage.setItem(AUTH_KEYS.admin, JSON.stringify({ email: user.email, name: user.name, role: user.role }))
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
  try { return JSON.parse(localStorage.getItem(AUTH_KEYS.student) || 'null') } catch { return null }
}

export function getAdminSession() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEYS.admin) || 'null') } catch { return null }
}

export async function loadDemoUsers() {
  const response = await fetch('/data/demo-users.json', { cache: 'no-store' })
  if (!response.ok) throw new Error('Unable to load demo users')
  return response.json()
}
