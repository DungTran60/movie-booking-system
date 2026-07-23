import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/services/api'
import { decodeJwt } from '@/utils/jwt'

export interface UserState {
  userId: string
  role: string
  tenantId?: number
}

interface AuthContextType {
  user: UserState | null
  role: string | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserState | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (storedToken && storedRefreshToken) {
        const decoded = decodeJwt(storedToken)
        if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setRefreshToken(storedRefreshToken)
          setUser({
            userId: decoded.sub,
            role: decoded.role || 'CUSTOMER',
            tenantId: decoded.tenantId,
          })
        } else {
          // Token expired, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (accessToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    setToken(accessToken)
    setRefreshToken(newRefreshToken)

    const decoded = decodeJwt(accessToken)
    if (decoded) {
      setUser({
        userId: decoded.sub,
        role: decoded.role || 'CUSTOMER',
        tenantId: decoded.tenantId,
      })
    }
  }

  const logout = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken')
    try {
      if (currentRefreshToken) {
        await api.post('/v1/auth/logout', { refreshToken: currentRefreshToken })
      }
    } catch (e) {
      console.warn('Logout API call failed or ignored', e)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setToken(null)
      setRefreshToken(null)
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        refreshToken,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
