import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import LeaveHistoryTable from './LeaveHistoryTable';

const LeaveHistory: React.FC = () => {
  const { leaves, loading, refreshLeaves } = useLeave();
  const [searching, setSearching] = useState(false);

  const handleSearch = async (filters: any) => {
    setSearching(true);
    // Implement search logic here
    console.log('Searching with filters:', filters);
    // You can call refreshLeaves with filters if your API supports it
    setSearching(false);
  };

  // Convert leave data to the format expected by LeaveHistoryTable
  const formattedLeaves = leaves?.map(leave => ({
    id: leave.id,
    type: leave.leaveTypeName,
    mode: leave.totalDays === 1 ? 'Full Day' : leave.totalDays === 0.5 ? 'Half Day' : 'Multi-Day',
    days: leave.totalDays,
    reason: leave.reason,
    comment: leave.hodComment || leave.hrComment,
    status: leave.status,
    fromDate: leave.startDate,
    toDate: leave.endDate,
    leaveTypeName: leave.leaveTypeName,
    startDate: leave.startDate,
    endDate: leave.endDate,
    totalDays: leave.totalDays
  })) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leave History</h2>
        <p className="text-gray-600 mt-1">View all your leave applications and their status</p>
      </div>

      <LeaveHistoryTable 
        leaves={formattedLeaves} 
        onSearch={handleSearch}
      />
    </div>
  );
};

export default LeaveHistory;