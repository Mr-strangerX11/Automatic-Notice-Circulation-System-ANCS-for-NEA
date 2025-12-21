import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'

export default function AdminDashboard() {
  const [data, setData] = useState({})

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data)).catch(console.error)
  }, [])

  const cards = [
    { label: 'Total notices', value: data.total_notices },
    { label: 'Delivered reports', value: data.delivered_reports },
    { label: 'Urgent notices', value: data.urgent_notices },
    { label: 'Failed deliveries', value: data.failed_deliveries },
    { label: 'Active departments', value: data.active_departments },
  ]

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-slate-800 p-4 rounded shadow">
            <p className="text-slate-300 text-sm">{c.label}</p>
            <p className="text-3xl font-bold text-emerald-300">{c.value ?? 0}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
