import { apiRequest } from './apiClient'

export function getCategories() {
  return apiRequest('/api/categories', {
    method: 'GET',
  })
}

export function createCategory(payload) {
  return apiRequest('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCategory(categoryId, payload) {
  return apiRequest(`/api/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(categoryId) {
  return apiRequest(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  })
}