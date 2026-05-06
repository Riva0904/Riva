import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, setAuthToken, getStoredAuthToken } from '../api/auth'

export interface User {
  id?: number
  username: string
  email: string
  role: string
  isVerified?: boolean
  subscriptionTier?: string
  subscriptionExpiryDate?: string | null
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
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = getStoredAuthToken()
      if (token) {
        try {
          const currentUser = await getCurrentUser()
          setUser({
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            isVerified: currentUser.isVerified,
          })
        } catch (err) {
          // Token might be invalid or expired
          setAuthToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  const loginSuccess = (token: string, userData: User) => {
    setAuthToken(token)
    setUser(userData)
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    setUser,
    logout,
    loginSuccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
