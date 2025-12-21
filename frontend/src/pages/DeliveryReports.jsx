import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DeliveryReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    api.get('/notices/').then(async (res) => {
      const withStats = await Promise.all(
        res.data.map(async (n) => {
          const tracking = await api.get(`/notices/${n.id}/tracking/`)
          return { ...n, tracking: tracking.data }
        })
      )
      setReports(withStats)
    })
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Delivery Reports</h1>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-slate-800 p-4 rounded">
            <p className="font-semibold">{r.title}</p>
            <p className="text-sm text-slate-400">Priority: {r.priority} | Status: {r.status}</p>
            <p className="text-sm text-emerald-300 mt-2">Views: {r.tracking.filter((t) => t.viewed_at).length} | Downloads: {r.tracking.filter((t) => t.downloaded).length}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
