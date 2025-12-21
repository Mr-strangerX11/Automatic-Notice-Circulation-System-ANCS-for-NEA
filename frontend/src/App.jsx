import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import AdminDashboard from './pages/AdminDashboard'
import CreateNotice from './pages/CreateNotice'
import ManageNotices from './pages/ManageNotices'
import NoticeArchive from './pages/NoticeArchive'
import DeliveryReports from './pages/DeliveryReports'
import DepartmentManagement from './pages/DepartmentManagement'
import UserManagement from './pages/UserManagement'
import DepartmentDashboard from './pages/DepartmentDashboard'
import ViewNotices from './pages/ViewNotices'
import MyDownloads from './pages/MyDownloads'
import AcknowledgementPage from './pages/AcknowledgementPage'
import NoticeDetails from './pages/NoticeDetails'
import DigitalNoticeboard from './pages/DigitalNoticeboard'
import { initPush } from './firebase'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  useEffect(() => {
    initPush().then((token) => {
      if (token) {
        console.info('FCM token', token)
      }
    })
  }, [])

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/board" element={<DigitalNoticeboard />} />
        <Route path="/notices/:id" element={<NoticeDetails />} />

        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/create" element={<PrivateRoute><CreateNotice /></PrivateRoute>} />
        <Route path="/admin/notices" element={<PrivateRoute><ManageNotices /></PrivateRoute>} />
        <Route path="/admin/archive" element={<PrivateRoute><NoticeArchive /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute><DeliveryReports /></PrivateRoute>} />
        <Route path="/admin/departments" element={<PrivateRoute><DepartmentManagement /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />

        <Route path="/department/dashboard" element={<PrivateRoute><DepartmentDashboard /></PrivateRoute>} />
        <Route path="/department/notices" element={<PrivateRoute><ViewNotices /></PrivateRoute>} />
        <Route path="/department/downloads" element={<PrivateRoute><MyDownloads /></PrivateRoute>} />
        <Route path="/department/ack" element={<PrivateRoute><AcknowledgementPage /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
