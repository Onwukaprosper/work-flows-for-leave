// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'

const Login = lazy(() => import('./components/auth/Login'))
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'))
const LeaveApplication = lazy(() => import('./components/leave/LeaveApplication'))
const LeaveHistory = lazy(() => import('./components/leave/LeaveHistory'))
const LeaveCalendar = lazy(() => import('./components/leave/LeaveCalendar'))
const LeaveApproval = lazy(() => import('./components/leave/LeaveApproval'))
const UserManagement = lazy(() => import('./components/admin/UserManagement'))
const Reports = lazy(() => import('./components/admin/Reports'))

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leave/apply" element={<LeaveApplication />} />
              <Route path="leave/history" element={<LeaveHistory />} />
              <Route path="leave/calendar" element={<LeaveCalendar />} />
              <Route path="leave/approval" element={<LeaveApproval />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/reports" element={<Reports />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App