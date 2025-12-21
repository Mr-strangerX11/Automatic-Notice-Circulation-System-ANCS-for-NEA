import React from 'react'
import Layout from '../components/Layout'

export default function AcknowledgementPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Acknowledgement</h1>
      <p className="text-slate-300 mb-4">Click acknowledge to mark the notice as seen.</p>
      <button className="px-4 py-2 bg-primary rounded">Acknowledge</button>
    </Layout>
  )
}
