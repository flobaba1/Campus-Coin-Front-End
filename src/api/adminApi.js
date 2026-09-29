import { apiRequest } from './apiClient'

export function getAdminUsers() {
  return apiRequest('/api/admin/users', {
    method: 'GET',
  })
}

export function getAdminDailyActiveStudents(days = 30) {
  return apiRequest(`/api/admin/analytics/active-students?days=${days}`, {
    method: 'GET',
  })
}

export function getAdminDailyTransactions(days = 14) {
  return apiRequest(`/api/admin/analytics/transactions/daily?days=${days}`, {
    method: 'GET',
  })
}

export function getAdminCategoryAnalytics(days = 30) {
  return apiRequest(`/api/admin/analytics/transactions/categories?days=${days}`, {
    method: 'GET',
  })
}

export function getRecentAdminAuditLogs() {
  return apiRequest('/api/admin/audit-logs/recent', {
    method: 'GET',
  })
}

export function getAdminNotifications() {
  return apiRequest('/api/admin/notification', {
    method: 'GET',
  })
}

export function createAdminNotification(payload) {
  return apiRequest('/api/admin/notification', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminNotification(notificationId, payload) {
  return apiRequest(`/api/admin/notification/${encodeURIComponent(notificationId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminNotification(notificationId) {
  return apiRequest(`/api/admin/notification/${encodeURIComponent(notificationId)}`, {
    method: 'DELETE',
  })
}

export function suspendAdminUser(userId) {
  return apiRequest(`/api/admin/users/${userId}/suspend`, {
    method: 'PUT',
  })
}

export function activateAdminUser(userId) {
  return apiRequest(`/api/admin/users/${userId}/activate`, {
    method: 'PUT',
  })
}

export function getAdminCategories() {
  return apiRequest('/api/admin/categories', {
    method: 'GET',
  })
}

export function createAdminCategory(payload) {
  return apiRequest('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminCategory(categoryId, payload) {
  return apiRequest(`/api/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminCategory(categoryId) {
  return apiRequest(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
  })
}
