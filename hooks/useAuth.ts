'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user.type'
import { api } from '@/lib/api'

function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  
  const checkAuth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getCurrentUser()
      
      if (response.authenticated && response.user) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setUser(null)
      setError(err instanceof Error ? err.message : 'Authentication check failed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initiate Google OAuth login
   */
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get Google OAuth URL from backend
      const { url } = await api.getGoogleAuthUrl()
      
      // Redirect to Google OAuth
      window.location.href = url
    } catch (err) {
      console.error('Google login failed:', err)
      setError(err instanceof Error ? err.message : 'Google login failed')
      setLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await api.logout()
      setUser(null)
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
      setError(err instanceof Error ? err.message : 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manual login (for backward compatibility)
   * This stores user in state but doesn't create a session
   */
  const login = (userData: User) => {
    setUser(userData)
  }

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    checkAuth,
    login, // Keep for backward compatibility
    isAuthenticated: !!user,
  }
}

export default useAuth