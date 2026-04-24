import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import { useAuth } from '../../hooks/useAuth';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { differenceInYears, differenceInMonths } from 'date-fns';
import toast from 'react-hot-toast';

const LeaveApproval: React.FC = () => {
  const { user } = useAuth();
  const { pendingApprovals, approveLeave, rejectLeave, loading } = useLeave();
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [comment, setComment] = useState('');
  
  // Filter approvals based on role workflow tier
  const filteredApprovals = pendingApprovals?.filter((leave: any) => {
    const applicantRole = leave.user?.role || 'staff';
    
    if (user?.role === 'hod') {
      return leave.status === 'pending' && applicantRole === 'staff';
    }
    if (user?.role === 'hr') {
      return leave.status === 'vc_approved';
    }
    if (user?.role === 'vc') {
      return (leave.status === 'pending' && ['hod', 'dean'].includes(applicantRole)) || leave.status === 'hod_approved';
    }
    if (user?.role === 'bursar') {
      return leave.status === 'pending_bursary';
    }
    if (user?.role === 'admin') return true;
    return false;
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  
  // Specific role states
  const [registrarGrantedDays, setRegistrarGrantedDays] = useState<number>(0);
  const [deferLeave, setDeferLeave] = useState<boolean>(false);
  const [deferralDate, setDeferralDate] = useState<string>('');

  const getBadgeLabel = (status: string, role: string) => {
    if (status === 'pending') return role === 'staff' ? 'Pending HOD Approval' : 'Pending VC Approval';
    if (status === 'hod_approved') return 'Pending VC Approval';
    if (status === 'vc_approved') return 'Pending HR/Registrar Approval';
    if (status === 'pending_bursary') return 'Pending Bursary Clearance';
    return 'Pending';
  };

  const getBadgeColor = (status: string) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'hod_approved' || status === 'vc_approved') return 'bg-blue-100 text-blue-800';
    if (status === 'pending_bursary') return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  const handleApprove = async (leaveId: number) => {
    // Collect extra payload based on role
    const payload: any = { comment };
    if (user?.role === 'hr') {
      payload.registrarGrantedDays = registrarGrantedDays;
    }
    if (user?.role === 'hod') {
      payload.isDeferred = deferLeave;
      if (deferLeave) payload.postponedDefermentDate = deferralDate;
    }

    await approveLeave(leaveId, payload);
    setSelectedLeave(null);
    setComment('');
    setRegistrarGrantedDays(0);
    setDeferLeave(false);
    setDeferralDate('');
  };

  const handleReject = async (leaveId: number) => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    await rejectLeave(leaveId, rejectionReason);
    setSelectedLeave(null);
    setRejectionReason('');
  };

  const handleMarkAsCompleted = async (_leaveId: number) => {
    toast.error('This action is not available in the current version.');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
        <p className="text-gray-600 mt-1">Review, approve, and manage leave applications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approvals ({filteredApprovals?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Leaves
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed/Expired
          </button>
        </nav>
      </div>

      {/* Content based on tab */}
      <div className="space-y-4">
        {/* Pending Approvals */}
        {activeTab === 'pending' && (
          <>
            {filteredApprovals?.map((leave: any) => (
              <div key={leave.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Leave details */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{leave.user?.department} - {leave.user?.position}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(leave.status)}`}>
                    {getBadgeLabel(leave.status, leave.user?.role || 'staff')}
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
                    <p className="text-gray-500">Total Days Applied</p>
                    <p className="font-medium text-gray-900">{leave.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Applied On</p>
                    <p className="font-medium text-gray-900">{new Date(leave.appliedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Extra info for HR / Registrar */}
                  {user?.role === 'hr' && (
                    <>
                      <div>
                        <p className="text-gray-500">Appointment Date</p>
                        <p className="font-medium text-gray-900">
                          {leave.user?.dateOfAppointment ? new Date(leave.user.dateOfAppointment).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Length of Service</p>
                        <p className="font-medium text-gray-900">
                          {leave.user?.dateOfAppointment 
                            ? `${differenceInYears(new Date(), new Date(leave.user.dateOfAppointment))} yrs, ${differenceInMonths(new Date(), new Date(leave.user.dateOfAppointment)) % 12} mos` 
                            : 'Unknown'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-gray-500 text-sm mb-1">Reason</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{leave.reason}</p>
                </div>

                {selectedLeave === leave.id && (
                  <div className="mb-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {/* HR specifics */}
                    {user?.role === 'hr' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registrar Granted Days *
                        </label>
                        <input
                          type="number"
                          value={registrarGrantedDays}
                          onChange={(e) => setRegistrarGrantedDays(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          min={0}
                        />
                      </div>
                    )}
                    
                    {/* HOD specifics */}
                    {user?.role === 'hod' && (
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={deferLeave}
                            onChange={(e) => setDeferLeave(e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          Is Leave to be deferred?
                        </label>
                        {deferLeave && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">When will it be taken?</label>
                            <input
                              type="date"
                              value={deferralDate}
                              onChange={(e) => setDeferralDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejection Reason Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Provide reason for rejection..."
                      />
                    </div>

                    {/* General Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {user?.role === 'hr' ? 'Registrar Remarks' : user?.role === 'bursar' ? 'Bursary Remarks' : 'Comments'} (Optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Add any comments or remarks..."
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  {selectedLeave === leave.id ? (
                    <>
                      <button
                        onClick={() => handleReject(leave.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => handleApprove(leave.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Confirm Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(null);
                          setRejectionReason('');
                          setComment('');
                          setRegistrarGrantedDays(0);
                          setDeferLeave(false);
                          setDeferralDate('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedLeave(leave.id)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Review & Reject
                      </button>
                      <button
                        onClick={() => setSelectedLeave(leave.id)}
                        className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 flex items-center gap-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Review & Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {(!filteredApprovals || filteredApprovals.length === 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Pending Approvals</h3>
                <p className="text-gray-500 mt-1">All leave applications have been processed</p>
              </div>
            )}
          </>
        )}

        {/* Active Leaves Tab */}
        {activeTab === 'active' && (
          <>
            {pendingApprovals?.filter(l => l.status === 'active').map((leave: any) => (
              <div key={leave.id} className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{leave.user?.department}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Currently ON LEAVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Leave Period</p>
                    <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Return Date</p>
                    <p className="font-medium text-orange-600">{new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleMarkAsCompleted(leave.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Mark as Returned to Duty
                  </button>
                </div>
              </div>
            ))}

            {(!pendingApprovals || pendingApprovals.filter(l => l.status === 'active').length === 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">No Active Leaves</h3>
                <p className="text-gray-500 mt-1">No staff members are currently on leave</p>
              </div>
            )}
          </>
        )}

        {/* Completed Leaves Tab */}
        {activeTab === 'completed' && (
          <>
            {pendingApprovals?.filter(l => l.status === 'completed').map((leave: any) => (
              <div key={leave.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{leave.user?.department}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    COMPLETED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Leave Period</p>
                    <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual Days Taken</p>
                    <p className="font-medium">{leave.actualDays || leave.totalDays} days</p>
                  </div>
                </div>
              </div>
            ))}

            {(!pendingApprovals || pendingApprovals.filter(l => l.status === 'completed').length === 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">No Completed Leaves</h3>
                <p className="text-gray-500 mt-1">No leave records have been completed yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;