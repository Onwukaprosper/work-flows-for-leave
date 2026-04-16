import React, { createContext, useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import type { LeaveApplication, LeaveBalance } from '../services/leaveService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface LeaveContextType {
  leaves: LeaveApplication[] | null;
  balance: LeaveBalance | null;
  pendingApprovals: LeaveApplication[] | null;
  loading: boolean;
  applyForLeave: (formData: FormData) => Promise<void>;
  approveLeave: (leaveId: number, comment?: string) => Promise<void>;
  rejectLeave: (leaveId: number, comment?: string) => Promise<void>;
  refreshLeaves: () => Promise<void>;
}

export const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[] | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveApplication[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    if (!user) return;
    try {
      const data = await leaveService.getUserLeaves(user.id);
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;
    try {
      const data = await leaveService.getLeaveBalance(user.id);
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    if (!user || !['hod', 'hr', 'admin'].includes(user.role)) return;
    try {
      const data = await leaveService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    }
  };

  const refreshLeaves = async () => {
    setLoading(true);
    await Promise.all([fetchLeaves(), fetchBalance(), fetchPendingApprovals()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshLeaves();
    }
  }, [user]);

  const applyForLeave = async (formData: FormData) => {
    try {
      await leaveService.applyForLeave(formData);
      toast.success('Leave application submitted successfully!');
      await refreshLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
      throw error;
    }
  };

  const approveLeave = async (leaveId: number, comment?: string) => {
    try {
      await leaveService.approveLeave(leaveId, comment);
      toast.success('Leave approved successfully!');
      await refreshLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
      throw error;
    }
  };

  const rejectLeave = async (leaveId: number, comment?: string) => {
    try {
      await leaveService.rejectLeave(leaveId, comment);
      toast.success('Leave rejected');
      await refreshLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
      throw error;
    }
  };

  return (
    <LeaveContext.Provider
      value={{
        leaves,
        balance,
        pendingApprovals,
        loading,
        applyForLeave,
        approveLeave,
        rejectLeave,
        refreshLeaves
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};