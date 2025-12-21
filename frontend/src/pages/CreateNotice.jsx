import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function CreateNotice() {
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', file_url: '', expiry_date: '' })
  const [selected, setSelected] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/departments/').then((res) => setDepartments(res.data))
  }, [])

  const toggleDept = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/notices/', { ...form, department_ids: selected })
      setMessage('Notice created; awaiting approval.')
    } catch (err) {
      setMessage('Error creating notice')
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Create Notice</h1>
        {message && <p className="mb-3 text-emerald-300">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full bg-slate-800 p-3 rounded" />
          <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" className="w-full bg-slate-800 p-3 rounded" rows="5"></textarea>
          <input name="file_url" value={form.file_url} onChange={handleChange} placeholder="File URL" className="w-full bg-slate-800 p-3 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <select name="priority" value={form.priority} onChange={handleChange} className="bg-slate-800 p-3 rounded">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} className="bg-slate-800 p-3 rounded" />
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <p className="text-sm text-slate-300 mb-2">Distribute to departments</p>
            <div className="grid md:grid-cols-3 gap-2">
              {departments.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleDept(d.id)} />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
          <button className="bg-primary hover:bg-emerald-700 px-4 py-3 rounded font-semibold">Save</button>
        </form>
      </div>
    </Layout>
  )
}
