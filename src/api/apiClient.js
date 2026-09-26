const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not configured. Please create a .env file in the project root.'
  )
}

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

  return data
}