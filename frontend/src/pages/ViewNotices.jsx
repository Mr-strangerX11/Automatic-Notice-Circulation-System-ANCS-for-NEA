import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function ViewNotices() {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    api.get('/notices/').then((res) => setNotices(res.data))
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Recent Notices</h1>
      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="bg-slate-800 p-4 rounded flex items-center justify-between">
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-slate-400">{n.priority} priority</p>
            </div>
            <Link to={`/notices/${n.id}`} className="text-emerald-300 text-sm">Open</Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}
