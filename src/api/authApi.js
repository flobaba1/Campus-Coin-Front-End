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