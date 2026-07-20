import { useState, useCallback, useMemo } from 'react'
import { AuthContext } from './AuthContext'

const STORAGE_KEY = 'pos_auth'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const login = useCallback((name, role) => {
    const userData = { name, role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    login,
    logout,
  }), [user, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
