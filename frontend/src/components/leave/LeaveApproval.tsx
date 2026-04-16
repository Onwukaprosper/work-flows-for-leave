import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LeaveApproval: React.FC = () => {
  const { pendingApprovals, approveLeave, rejectLeave, loading } = useLeave();
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [comment, setComment] = useState('');

  const handleApprove = async (leaveId: number) => {
    await approveLeave(leaveId, comment);
    setSelectedLeave(null);
    setComment('');
  };

  const handleReject = async (leaveId: number) => {
    await rejectLeave(leaveId, comment);
    setSelectedLeave(null);
    setComment('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
        <p className="text-gray-600 mt-1">Review and process leave applications</p>
      </div>

      <div className="space-y-4">
        {pendingApprovals?.map((leave: any) => (
          <div key={leave.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {leave.user?.firstName} {leave.user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{leave.user?.department} - {leave.user?.position}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                leave.status === 'hod_approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {leave.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Leave Type</p>
                <p className="font-medium text-gray-900">{leave.leaveTypeName}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Days</p>
                <p className="font-medium text-gray-900">{leave.totalDays} days</p>
              </div>
              <div>
                <p className="text-gray-500">Applied On</p>
                <p className="font-medium text-gray-900">{new Date(leave.appliedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Reason</p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{leave.reason}</p>
            </div>

            {selectedLeave === leave.id && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add any comments or remarks..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              {selectedLeave === leave.id ? (
                <>
                  <button
                    onClick={() => handleApprove(leave.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Confirm Approve
                  </button>
                  <button
                    onClick={() => handleReject(leave.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => setSelectedLeave(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedLeave(leave.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Review Application
                  </button>
                  <button
                    onClick={() => handleApprove(leave.id)}
                    disabled={loading}
                    className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                  >
                    Quick Approve
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {(!pendingApprovals || pendingApprovals.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Pending Approvals</h3>
            <p className="text-gray-500 mt-1">All leave applications have been processed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;