import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, ClockIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import StatCard from './StatCard';
import WorkHoursChart from './WorkHoursChart';
// import UpcomingHolidays from './UpcomingHolidays';
import RecentLeaveTable from './RecentLeaveTable';
import LeaveCalendarView from './LeaveCalendarView';
import QuickActions from './QuickActions';
import ImportantNotices from './ImportantNotices';

interface DashboardStats {
  leavesAllowed: number;
  availableLeave: number;
  leavesTaken: number;
  balanceLeave: number;
}


const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Mock data - we will replace this with API calls
  const stats: DashboardStats = {
    leavesAllowed: 20,
    availableLeave: 14,
    leavesTaken: 6,
    balanceLeave: 8
  };

  const workHours = {
    mon: 6,
    tue: 13,
    wed: 15,
    thu: 14,
    fri: 16,
    sat: 17,
    sun: 18
  };

  const recentLeaves = [
    { type: 'Monthly Leave', mode: 'Multi-Day', days: 2.0, reason: 'Emergency', status: 'pending' },
    { type: 'Casual Leave', mode: 'Multi-Day', days: 3.0, reason: 'Casual', status: 'cancelled' },
    { type: 'Emergency Leave', mode: 'Full Day', days: 1.0, reason: 'Emergency', status: 'approved' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your leave overview</p>
      </div>

      {/* Stats Cards - Matching your design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Leave(s) Allowed"
          value={stats.leavesAllowed}
          icon={<DocumentTextIcon className="h-8 w-8 text-green-500" />}
          color="blue"
        />
        <StatCard
          title="Available Leave"
          value={stats.availableLeave}
          icon={<ClockIcon className="h-8 w-8 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Leave(s) Taken"
          value={stats.leavesTaken}
          icon={<CalendarIcon className="h-8 w-8 text-orange-500" />}
          color="orange"
        />
        <StatCard
          title="Balance Leave(s)"
          value={stats.balanceLeave}
          icon={<UserGroupIcon className="h-8 w-8 text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Work Hours and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          {/* <WorkHoursChart data={workHours} /> */}
        </div>
        <div className="lg:col-span-3">
          <LeaveCalendarView />
        </div>
      </div>

      {/* Quick Actions and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <QuickActions />
        <ImportantNotices />
      </div>

      {/* Recent Leave Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Leave Applications</h2>
        </div>
        <RecentLeaveTable leaves={recentLeaves} />

        {/* <RecentLeaveTable 
          leaves={recentLeaves}
          onViewAll={() => navigate('/leave/history')}
        /> */}
      </div>
    </div>
  );
};

export default Dashboard;