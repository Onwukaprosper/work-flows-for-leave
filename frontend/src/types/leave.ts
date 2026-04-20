// export type LeaveStatus = 'pending' | 'hod_approved' | 'hr_approved' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: number;
  name: string;
  maxDays: number | null;
  requiresDocument: boolean;
  isPaid: boolean;
  description?: string;
}

// export interface LeaveApplication {
//   id: number;
//   userId: number;
//   user?: {
//     firstName: string;
//     lastName: string;
//     staffId: string;
//     department: string;
//   };
//   leaveTypeId: number;
//   leaveTypeName: string;
//   leaveType?: LeaveType;
//   startDate: string;
//   endDate: string;
//   totalDays: number;
//   reason: string;
//   documentPath?: string;
//   status: LeaveStatus;
//   hodComment?: string;
//   hrComment?: string;
//   adminComment?: string;
//   appliedAt: string;
//   hodApprovedAt?: string;
//   hrApprovedAt?: string;
//   finalApprovedAt?: string;
//   updatedAt?: string;
// }

export interface LeaveBalance {
  userId: number;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays?: number;
  approvedDays?: number;
}

export interface LeaveApplicationFormData {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  document?: File;
}

export interface LeaveFilters {
  startDate?: string;
  endDate?: string;
  leaveType?: number;
  status?: LeaveStatus;
  userId?: number;
  department?: string;
  page?: number;
  limit?: number;
}

export type LeaveStatus = 
  | 'pending'      // Initial submission
  | 'hod_approved' // HOD approved, pending HR
  | 'hr_approved'  // HR approved, pending final
  | 'approved'     // Fully approved
  | 'active'       // Currently on leave
  | 'completed'    // Leave completed, back to duty
  | 'rejected'     // Rejected by any level
  | 'cancelled';   // Cancelled by user

export interface LeaveApplication {
  id: number;
  userId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string; // When they actually returned
  totalDays: number;
  actualDays?: number; // Actual days taken
  reason: string;
  status: LeaveStatus;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  appliedAt: string;
  approvedAt?: string;
  activatedAt?: string; // When leave became active
  completedAt?: string; // When leave was completed
}