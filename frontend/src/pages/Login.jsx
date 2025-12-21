import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      nav('/admin/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">ANCS Login</h1>
        {error && <p className="text-red-400 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 bg-slate-700 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 bg-slate-700 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-primary hover:bg-emerald-700 py-3 rounded font-semibold">Login</button>
        </form>
        <Link to="/forgot" className="block text-sm text-emerald-300 mt-3">Forgot password?</Link>
      </div>
    </div>
  )
}
