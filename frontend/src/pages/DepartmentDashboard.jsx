import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DepartmentDashboard() {
  const [data, setData] = useState({ recent: [], unseen_count: 0, downloads: 0 })
  const [departmentId, setDepartmentId] = useState('')

  useEffect(() => {
    if (departmentId) {
      api.get(`/department/dashboard?department_id=${departmentId}`).then((res) => setData(res.data))
    }
  }, [departmentId])

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Department Dashboard</h1>
      <input className="bg-slate-800 p-3 rounded mb-4" placeholder="Department ID" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800 p-4 rounded">Unseen: {data.unseen_count}</div>
        <div className="bg-slate-800 p-4 rounded">Downloads: {data.downloads}</div>
        <div className="bg-slate-800 p-4 rounded">Recent: {data.recent.length}</div>
      </div>
      <div className="space-y-2">
        {data.recent.map((n) => (
          <div key={n.id} className="bg-slate-800 p-3 rounded">
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-slate-400">Priority: {n.priority}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
