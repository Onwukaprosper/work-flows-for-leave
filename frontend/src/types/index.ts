// frontend/src/types/index.ts

export interface User {
  id: number;
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: 'staff' | 'hod' | 'hr' | 'admin';
  remainingLeaveDays: number;
}

export interface LeaveApplication {
  id: number;
  userId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'hod_approved' | 'hr_approved' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}