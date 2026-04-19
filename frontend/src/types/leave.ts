// export interface LeaveApplication {
//   id: number;
//   userId: number;
//   leaveTypeId: number;
//   leaveTypeName: string;
//   startDate: string;
//   endDate: string;
//   totalDays: number;
//   reason: string;
//   status: 'pending' | 'hod_approved' | 'hr_approved' | 'approved' | 'rejected' | 'cancelled';
//   appliedAt: string;
// }


export type LeaveStatus = 'pending' | 'hod_approved' | 'vc_approved' | 'hr_approved' | 'bursar_approved' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: number;
  name: string;
  maxDays: number | null;
  requiresDocument: boolean;
  isPaid: boolean;
  description?: string;
}

export interface LeaveApplication {
  id: number;
  userId: number;
  user?: {
    firstName: string;
    lastName: string;
    staffId: string;
    department: string;
    presentPost?: string;
    salaryScale?: string;
    salaryGrade?: string;
    salaryStep?: number;
    dateOfAppointment?: string;
  };
  leaveTypeId: number;
  leaveTypeName: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  academicSession?: string;
  deferredDaysBroughtForward?: number;
  reasonForDeferment?: string;
  addressOnLeave?: string;
  expectedResumptionDate?: string;
  leaveGrantRequested?: boolean;
  registrarGrantedDays?: number;
  reason: string;
  documentPath?: string;
  status: LeaveStatus;
  hodComment?: string;
  vcComment?: string;
  hrComment?: string;
  bursarComment?: string;
  adminComment?: string;
  appliedAt: string;
  hodApprovedAt?: string;
  vcApprovedAt?: string;
  hrApprovedAt?: string;
  bursarApprovedAt?: string;
  finalApprovedAt?: string;
  updatedAt?: string;
}

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
  academicSession?: string;
  addressOnLeave?: string;
  deferredDaysBroughtForward?: number;
  reasonForDeferment?: string;
  leaveGrantRequested?: boolean;
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