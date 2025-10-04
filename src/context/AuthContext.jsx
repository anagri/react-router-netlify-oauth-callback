import { createContext, useContext, useState, useEffect } from 'react'
import { isAuthenticated as checkAuth, logout as performLogout, initiateLogin } from '../utils/auth'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth())

  useEffect(() => {
    setIsAuthenticated(checkAuth())
  }, [])

  const login = () => {
    initiateLogin()
  }

  const logout = () => {
    performLogout()
    setIsAuthenticated(false)
  }

  const updateAuthState = () => {
    setIsAuthenticated(checkAuth())
  }

  const value = {
    isAuthenticated,
    login,
    logout,
    updateAuthState
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
