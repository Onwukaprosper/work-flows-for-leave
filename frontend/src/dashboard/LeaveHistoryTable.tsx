import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface LeaveRecord {
  id: number;
  type: string;
  mode: 'Multi-Day' | 'Full Day' | 'Half Day';
  days: number;
  reason: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  fromDate?: string;
  toDate?: string;
}

interface LeaveHistoryTableProps {
  leaves: LeaveRecord[];
}

const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({ leaves }) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    leaveType: '',
    status: ''
  });

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="date"
            placeholder="DATE FROM"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <input
            type="date"
            placeholder="DATE TO"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
          >
            <option value="">LEAVE TYPE</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="maternity">Maternity Leave</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">SELECT STATUS</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
            SEARCH
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <React.Fragment key={leave.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{leave.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.mode}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.days.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.comment || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(leave.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRows.includes(leave.id) ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.includes(leave.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <p><strong>From:</strong> {leave.fromDate || 'N/A'}</p>
                        <p><strong>To:</strong> {leave.toDate || 'N/A'}</p>
                        {leave.comment && <p><strong>Detailed Comment:</strong> {leave.comment}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select className="border border-gray-300 rounded-md text-sm px-2 py-1">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistoryTable;