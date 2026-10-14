
import {
  getAdminSession,
  getStudentSession,
  clearAdminSession,
  clearStudentSession,
} from '../utils'
import { navigate } from '../routes/AppRoutes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not configured. Please create a .env file in the project root.'
  )
}

// Prevent several simultaneous failed requests from triggering
// repeated logout redirects.
let handlingExpiredSession = false

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not configured.')
}

export async function apiRequest(endpoint, options = {}) {
  const isAdminEndpoint = endpoint.startsWith('/api/admin/')
  const isAuthEndpoint = endpoint.startsWith('/api/auth/')

  const session = isAdminEndpoint
    ? getAdminSession()
    : getStudentSession()

  const token = session?.token

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type')
  let data

  if (contentType?.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    // A protected request has failed authentication.
    if (
      token &&
      !isAuthEndpoint &&
      [401, 403].includes(response.status)
    ) {
      if (!handlingExpiredSession) {
        handlingExpiredSession = true

        if (isAdminEndpoint) {
          clearAdminSession()
          navigate('/admin/sign-in')
        } else {
          clearStudentSession()
          navigate('/sign-in')
        }
      }
    }

    let errorMessage = 'Request failed'

    if (typeof data === 'object' && data !== null) {
      errorMessage =
        data.message ||
        data.error ||
        data.detail ||
        'Request failed'
    } else if (typeof data === 'string' && data.trim()) {
      errorMessage = data
    }

    throw new Error(errorMessage)
  }

  // Allow a fresh login after an expired session.
  if (
    endpoint === '/api/auth/login' ||
    endpoint === '/api/auth/admin-login'
  ) {
    handlingExpiredSession = false
  }

  return data
}
