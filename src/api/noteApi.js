import { apiRequest } from './apiClient'

export async function getNotes() {
  return apiRequest('/api/notes')
}

export async function getNote(noteId) {
  return apiRequest(`/api/notes/${noteId}`)
}

export async function createNote(payload) {
  return apiRequest('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateNote(noteId, payload) {
  return apiRequest(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteNote(noteId) {
  return apiRequest(`/api/notes/${noteId}`, {
    method: 'DELETE',
  })
}
