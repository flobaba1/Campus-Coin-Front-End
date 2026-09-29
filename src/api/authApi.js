import { apiRequest } from './apiClient'

export function signup(payload) {
  return apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function signin(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export function adminSignin(email, password) {
  return apiRequest('/api/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
}

export function resetPassword(otpId, otpCode, newPassword) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      otpId,
      otpCode,
      newPassword,
    }),
  })
}