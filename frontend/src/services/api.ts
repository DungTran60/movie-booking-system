import axios from 'axios'
import type { ApiResponse } from '@/types'
import type { AuthResponse } from '@/features/auth/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Access Token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Variables for managing token refresh concurrency
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

const onRefreshFailed = () => {
  refreshSubscribers = []
}

// Response interceptor: catch 401 and auto-refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/v1/auth/refresh') &&
      !originalRequest.url?.includes('/v1/auth/login')
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          '/api/v1/auth/refresh',
          { refreshToken }
        )

        const envelope = refreshResponse.data
        if (envelope.status === 'SUCCESS' && envelope.data) {
          const { accessToken, refreshToken: newRefreshToken } = envelope.data
          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
          onRefreshed(accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } else {
          throw new Error(envelope.message || 'Token refresh failed')
        }
      } catch (refreshErr) {
        onRefreshFailed()
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
