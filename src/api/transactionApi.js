import { apiRequest } from './apiClient'

export function getTransactions() {
  return apiRequest('/api/transactions', {
    method: 'GET',
  })
}

export function createTransaction(payload) {
  return apiRequest('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTransaction(transactionId, payload) {
  return apiRequest(`/api/transactions/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTransaction(transactionId) {
  return apiRequest(`/api/transactions/${transactionId}`, {
    method: 'DELETE',
  })
}