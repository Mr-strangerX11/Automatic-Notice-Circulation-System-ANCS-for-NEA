import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function NoticeArchive() {
  const [items, setItems] = useState([])

  useEffect(() => {
    api.get('/notices/?status=archived').then((res) => {
      setItems(res.data.filter((n) => n.status === 'archived'))
    })
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Notice Archive</h1>
      <div className="space-y-3">
        {items.map((n) => (
          <div key={n.id} className="bg-slate-800 p-4 rounded">
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-slate-400">Expired on {n.expiry_date}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
