import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function NoticeDetails() {
  const { id } = useParams()
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    api.get(`/notices/${id}/`).then((res) => setNotice(res.data))
  }, [id])

  if (!notice) return <Layout>Loading...</Layout>

  return (
    <Layout>
      <div className="max-w-3xl space-y-3">
        <p className="text-sm text-slate-400">Priority: {notice.priority} | Status: {notice.status}</p>
        <h1 className="text-3xl font-semibold">{notice.title}</h1>
        <article className="prose prose-invert" dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, '<br/>') }}></article>
        {notice.file_url && (
          <a href={notice.file_url} target="_blank" rel="noreferrer" className="inline-block bg-primary px-4 py-2 rounded text-white">Download</a>
        )}
      </div>
    </Layout>
  )
}
