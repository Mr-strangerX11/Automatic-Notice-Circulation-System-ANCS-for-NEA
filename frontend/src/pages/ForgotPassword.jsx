import React, { useState } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
        {submitted ? (
          <p className="text-emerald-300">If the email exists, instructions have been sent.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full p-3 bg-slate-700 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="w-full bg-primary hover:bg-emerald-700 py-3 rounded font-semibold">Send</button>
          </form>
        )}
      </div>
    </div>
  )
}
