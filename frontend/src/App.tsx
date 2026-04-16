// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Suspense, lazy } from 'react';
// import { AuthProvider } from './contexts/AuthContexts';
// import { LeaveProvider } from './contexts/LeaveContexts';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import Layout from './components/common/Layout';

// // Lazy load components for better performance
// const Login = lazy(() => import('./components/auth/Login'));
// // const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
// const Dashboard = lazy(() => import('./dashboard/Dashboard'));
// const LeaveApplication = lazy(() => import('./components/leave/LeaveApplication'));
// const LeaveHistory = lazy(() => import('./components/leave/LeaveHistory'));
// const LeaveCalendar = lazy(() => import('./components/leave/LeaveCalendar'));
// const LeaveApproval = lazy(() => import('./components/leave/LeaveApproval'));
// const UserManagement = lazy(() => import('./components/admin/UserManagement'));
// const Reports = lazy(() => import('./components/admin/Reports'));

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <LeaveProvider>
//           <Suspense fallback={
//             <div className="flex justify-center items-center h-screen">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//             </div>
//           }>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//                 <Route index element={<Navigate to="/dashboard" />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="leave/apply" element={<LeaveApplication />} />
//                 <Route path="leave/history" element={<LeaveHistory />} />
//                 <Route path="leave/calendar" element={<LeaveCalendar />} />
//                 <Route path="leave/approval" element={
//                   <ProtectedRoute allowedRoles={['hod', 'hr', 'admin']}>
//                     <LeaveApproval />
//                   </ProtectedRoute>
//                 } />
//                 <Route path="admin/users" element={
//                   <ProtectedRoute allowedRoles={['admin']}>
//                     <UserManagement />
//                   </ProtectedRoute>
//                 } />
//                 <Route path="admin/reports" element={
//                   <ProtectedRoute allowedRoles={['hr', 'admin']}>
//                     <Reports />
//                   </ProtectedRoute>
//                 } />
//               </Route>
//             </Routes>
//           </Suspense>
//         </LeaveProvider>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContexts';
import { LeaveProvider } from './contexts/LeaveContexts';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const LeaveApplication = lazy(() => import('./components/leave/LeaveApplication'));
const LeaveHistory = lazy(() => import('./components/leave/LeaveHistory'));
const LeaveCalendar = lazy(() => import('./components/leave/LeaveCalendar'));
const LeaveApproval = lazy(() => import('./components/leave/LeaveApproval'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const DepartmentManagement = lazy(() => import('./components/admin/DepartmentManagement'));
const Reports = lazy(() => import('./components/admin/Reports'));
const Settings = lazy(() => import('./components/settings/Settings'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <LeaveProvider>
          <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leave/apply" element={<LeaveApplication />} />
                <Route path="leave/history" element={<LeaveHistory />} />
                <Route path="leave/calendar" element={<LeaveCalendar />} />
                <Route path="leave/approval" element={
                  <ProtectedRoute allowedRoles={['hod', 'hr', 'admin']}>
                    <LeaveApproval />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/departments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/reports" element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </LeaveProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;