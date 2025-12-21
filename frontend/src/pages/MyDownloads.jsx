import React from 'react'
import Layout from '../components/Layout'

export default function MyDownloads() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">My Downloads</h1>
      <p className="text-slate-300">Download tracking is recorded server-side. This view surfaces downloaded notices in reports.</p>
    </Layout>
  )
}
