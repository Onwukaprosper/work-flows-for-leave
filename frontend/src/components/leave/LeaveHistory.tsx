import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import LeaveHistoryTable from './LeaveHistoryTable';
import PDFExportService from '../../services/pdfExportService';
import { useAuth } from '../../hooks/useAuth';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LeaveHistory: React.FC = () => {
  const { leaves, loading, refreshLeaves } = useLeave();
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  
  const handleExportPDF = () => {
    if (leaves && leaves.length > 0 && user) {
      PDFExportService.exportLeaveHistory(leaves, user);
      toast.success('PDF exported successfully!');
    } else {
      toast.error('No data to export');
    }
  };

  const handleSearch = async (filters: any) => {
    setSearching(true);
    console.log('Searching with filters:', filters);
    // You can call refreshLeaves with filters if your API supports it
    await refreshLeaves();
    setSearching(false);
  };

  // Convert leave data to the format expected by LeaveHistoryTable
  const formattedLeaves = leaves?.map(leave => ({
    id: leave.id,
    type: leave.leaveTypeName,
    mode: (leave.totalDays === 1 ? 'Full Day' : leave.totalDays === 0.5 ? 'Half Day' : 'Multi-Day') as "Full Day" | "Half Day" | "Multi-Day",
    days: leave.totalDays,
    reason: leave.reason,
    comment: leave.hodComment || leave.hrComment,
    status: leave.status as "approved" | "pending" | "rejected" | "cancelled",
    fromDate: leave.startDate,
    toDate: leave.endDate,
    leaveTypeName: leave.leaveTypeName,
    startDate: leave.startDate,
    endDate: leave.endDate,
    totalDays: leave.totalDays,
    documentPath: leave.documentPath
  })) || [];

  if (loading || searching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Leave History</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all your leave applications and their status</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!leaves || leaves.length === 0}
        >
          <DocumentArrowUpIcon className="h-5 w-5" />
          Export PDF
        </button>
      </div>

      <LeaveHistoryTable 
        leaves={formattedLeaves} 
        onSearch={handleSearch}
      />
    </div>
  );
};

export default LeaveHistory;