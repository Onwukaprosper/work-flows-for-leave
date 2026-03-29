// frontend/src/components/LeaveDashboard.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { LeaveApplication, LeaveBalance } from '../types';
import LeaveApplicationForm from './LeaveApplicationForm';
import LeaveHistory from './LeaveHistory';
import LeaveBalanceCard from './LeaveBalanceCard';

const LeaveDashboard: React.FC = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('apply');

  const userId = parseInt(localStorage.getItem('userId') || '0');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const [applicationsRes, balanceRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/leave.php/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/leave.php/balance/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setApplications(applicationsRes.data);
      setBalance(balanceRes.data);
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = (application: LeaveApplication) => {
    setApplications([application, ...applications]);
    fetchLeaveData(); // Refresh balance
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Leave Management Dashboard</h1>
      
      {balance && <LeaveBalanceCard balance={balance} />}

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('apply')}
            className={`py-2 px-4 ${
              activeTab === 'apply'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Apply for Leave
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Leave History
          </button>
        </nav>
      </div>

      {activeTab === 'apply' ? (
        <LeaveApplicationForm userId={userId} onSubmit={handleApplicationSubmit} />
      ) : (
        <LeaveHistory applications={applications} />
      )}
    </div>
  );
};

export default LeaveDashboard;