import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'staff', password: '', department_id: '' })

  useEffect(() => {
    api.get('/departments/').then((res) => setDepartments(res.data))
  }, [])

  const loadUsers = async () => {
    // There is no list users endpoint; using notices tracking data placeholder
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const createUser = async (e) => {
    e.preventDefault()
    await api.post('/auth/register', form)
    setForm({ name: '', email: '', phone: '', role: 'staff', password: '', department_id: '' })
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <form onSubmit={createUser} className="grid md:grid-cols-2 gap-3 bg-slate-800 p-4 rounded mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="bg-slate-700 p-3 rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="bg-slate-700 p-3 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="bg-slate-700 p-3 rounded" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="bg-slate-700 p-3 rounded" />
        <select name="role" value={form.role} onChange={handleChange} className="bg-slate-700 p-3 rounded">
          <option value="admin">Admin</option>
          <option value="department_head">Department Head</option>
          <option value="section_chief">Section Chief</option>
          <option value="staff">Staff</option>
          <option value="it_manager">IT System Manager</option>
        </select>
        <select name="department_id" value={form.department_id} onChange={handleChange} className="bg-slate-700 p-3 rounded">
          <option value="">No department</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button className="bg-primary px-4 py-3 rounded font-semibold">Create User</button>
      </form>
    </Layout>
  )
}
