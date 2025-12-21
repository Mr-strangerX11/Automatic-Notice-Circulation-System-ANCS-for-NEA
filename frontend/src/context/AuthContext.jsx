import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ancs_user') || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem('ancs_token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    }
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.access)
    localStorage.setItem('ancs_user', JSON.stringify(data.user))
    localStorage.setItem('ancs_token', data.access)
    localStorage.setItem('ancs_refresh', data.refresh)
    api.defaults.headers.common.Authorization = `Bearer ${data.access}`
    return data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', { refresh: localStorage.getItem('ancs_refresh') })
    } catch (err) {
      console.error(err)
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem('ancs_user')
    localStorage.removeItem('ancs_token')
    localStorage.removeItem('ancs_refresh')
    delete api.defaults.headers.common.Authorization
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
