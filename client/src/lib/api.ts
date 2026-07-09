const API_BASE = '/api'

let accessToken: string | null = localStorage.getItem('accessToken')

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) localStorage.setItem('accessToken', token)
  else localStorage.removeItem('accessToken')
}

export function getAccessToken() {
  return accessToken
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setAccessToken(data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        headers['Authorization'] = `Bearer ${data.accessToken}`
        const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
        if (!retryRes.ok) throw new Error(await retryRes.text())
        return retryRes.json()
      } else {
        localStorage.clear()
        window.location.href = '/login'
        throw new Error('Session expired')
      }
    } else {
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || 'Request failed')
  }

  return res.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', body: formData }),
}
