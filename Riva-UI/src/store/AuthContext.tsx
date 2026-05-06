import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, logout as _logout } from '../api/auth'
import { getStoredAuthToken, setAuthToken } from '../api/client'

export interface User {
  id?: number
  username: string
  email: string
  role: string
  isActive?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  loginSuccess: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredAuthToken()
      if (token) {
        try {
          const currentUser = await getCurrentUser()
          setUser({ username: currentUser.username, email: currentUser.email, role: currentUser.role, isActive: currentUser.isActive })
        } catch {
          setAuthToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const logout = () => { _logout(); setUser(null) }
  const loginSuccess = (token: string, userData: User) => { setAuthToken(token); setUser(userData) }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, setUser, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}
