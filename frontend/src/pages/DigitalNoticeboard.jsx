import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DigitalNoticeboard() {
  const [notices, setNotices] = useState([])
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('')

  useEffect(() => {
    api.get('/notices/').then((res) => setNotices(res.data))
  }, [])

  const filtered = notices.filter((n) => {
    const matchesText = n.title.toLowerCase().includes(query.toLowerCase())
    const matchesPriority = priority ? n.priority === priority : true
    return matchesText && matchesPriority
  })

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Digital Noticeboard</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <input className="bg-slate-800 p-3 rounded" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="bg-slate-800 p-3 rounded" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((n) => (
          <div key={n.id} className="bg-slate-800 p-4 rounded border-l-4" style={{ borderColor: n.priority === 'urgent' ? '#ef4444' : n.priority === 'high' ? '#f59e0b' : '#10b981' }}>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-slate-300">{n.content.slice(0, 120)}...</p>
            <p className="text-xs text-slate-500 mt-2">Priority: {n.priority}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
