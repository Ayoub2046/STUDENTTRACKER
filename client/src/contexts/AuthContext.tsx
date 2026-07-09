import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import { api, setAccessToken } from '../lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setAccessToken(token)
      api.get<{ id: string; email: string; name: string; role: string; avatar?: string; xpPoints: number; level: number; streak: number; isVerified: boolean; createdAt: string; profile?: any; settings?: any; _count?: any }>('/auth/profile')
        .then(data => {
          setUser(data as User)
        })
        .catch(() => {
          localStorage.clear()
          setAccessToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password })
    setAccessToken(data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', { email, password, name })
    setAccessToken(data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
