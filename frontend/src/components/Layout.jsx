import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-emerald-300">ANCS</span>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/admin/dashboard" className="hover:text-emerald-300">Dashboard</Link>
            <Link to="/admin/notices" className="hover:text-emerald-300">Notices</Link>
            <Link to="/admin/departments" className="hover:text-emerald-300">Departments</Link>
            <Link to="/admin/users" className="hover:text-emerald-300">Users</Link>
            <Link to="/board" className="hover:text-emerald-300">Noticeboard</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && <span className="text-emerald-200">{user.name} ({user.role})</span>}
          <button onClick={logout} className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600">Logout</button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
