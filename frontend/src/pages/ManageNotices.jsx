import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function ManageNotices() {
  const [notices, setNotices] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState([])

  const load = () => api.get('/notices/').then((res) => setNotices(res.data))

  useEffect(() => {
    load()
    api.get('/departments/').then((res) => setDepartments(res.data))
  }, [])

  const approve = async (id) => {
    await api.post(`/notices/${id}/approve/`, { department_ids: selectedDept })
    load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Manage Notices</h1>
        <a
          href="/admin/create"
          className="bg-primary hover:bg-emerald-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Create Notice
        </a>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {departments.map((d) => (
          <label key={d.id} className="text-sm bg-slate-800 px-3 py-1 rounded flex items-center gap-1">
            <input type="checkbox" checked={selectedDept.includes(d.id)} onChange={(e) => setSelectedDept((prev) => prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id])} />
            {d.name}
          </label>
        ))}
      </div>
      <div className="grid gap-3">
        {notices.map((n) => (
          <div key={n.id} className="bg-slate-800 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-slate-400">Priority: {n.priority} | Status: {n.status}</p>
              </div>
              {n.status !== 'approved' && (
                <button onClick={() => approve(n.id)} className="px-3 py-1 bg-emerald-700 rounded text-sm">Approve & Circulate</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
