import { apiRequest } from './apiClient'
import { getStudentSession } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getProfile() {
  return apiRequest('/api/profile')
}

export async function updateProfile(payload) {
  return apiRequest('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function uploadProfilePhoto(file) {
  const session = getStudentSession()
  const token = session?.token
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.message || data.error || 'Unable to upload profile photo'
        : data || 'Unable to upload profile photo'
    throw new Error(message)
  }

  return data
}

export async function deleteProfilePhoto() {
  return apiRequest('/api/profile/photo', {
    method: 'DELETE',
  })
}

export function getProfilePhotoUrl() {
  const session = getStudentSession()
  const token = session?.token

  // The <img> element cannot attach the Authorization header through the
  // existing apiClient, so callers should use loadProfilePhoto() below.
  return token ? `${API_BASE_URL}/api/profile/photo` : null
}

export async function loadProfilePhoto() {
  const session = getStudentSession()
  const token = session?.token
  if (!token) return null

  const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error('Unable to load profile photo')

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
