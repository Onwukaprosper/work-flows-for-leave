export type LeaveStatus = 
  | 'pending'           // Initial submission, pending HOD approval
  | 'hod_approved'      // HOD approved, pending HR/VC/Bursar
  | 'vc_approved'       // VC approved (if required)
  | 'hr_approved'       // HR approved
  | 'bursar_approved'   // Bursar approved (for leave grant)
  | 'approved'          // Fully approved, ready to be taken
  | 'active'            // Currently on leave
  | 'completed'         // Leave completed, back to duty
  | 'rejected'          // Rejected by any level
  | 'cancelled';        // Cancelled by user

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
    id?: number;
    firstName: string;
    lastName: string;
    staffId: string;
    department: string;
    position?: string;
    presentPost?: string;
    salaryScale?: string;
    salaryGrade?: string;
    salaryStep?: number;
    dateOfAppointment?: string;
    email?: string;
    phoneNumber?: string;
  };
  leaveTypeId: number;
  leaveTypeName: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  actualEndDate?: string;      // When they actually returned
  totalDays: number;
  actualDays?: number;          // Actual days taken
  
  // MOUAU specific fields
  collegeDeptUnit?: string;
  presentPost?: string;
  salaryScale?: string;
  salaryGrade?: string;
  salaryStep?: number;
  academicSession?: string;
  addressOnLeave?: string;
  expectedResumptionDate?: string;
  deferredDaysBroughtForward?: number;
  reasonForDeferment?: string;
  leaveGrantRequested?: boolean;
  registrarGrantedDays?: number;
  
  reason: string;
  documentPath?: string;
  status: LeaveStatus;
  
  // Approval comments from different roles
  hodComment?: string;
  vcComment?: string;
  hrComment?: string;
  bursarComment?: string;
  adminComment?: string;
  
  // Rejection tracking
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  
  // Timestamps
  appliedAt: string;
  hodApprovedAt?: string;
  vcApprovedAt?: string;
  hrApprovedAt?: string;
  bursarApprovedAt?: string;
  approvedAt?: string;
  activatedAt?: string;        // When leave became active
  completedAt?: string;         // When leave was completed
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
  collegeDeptUnit?: string;
  presentPost?: string;
  salaryScale?: string;
  salaryGrade?: string;
  salaryStep?: number;
  academicSession?: string;
  addressOnLeave?: string;
  deferredDaysBroughtForward?: number;
  reasonForDeferment?: string;
  leaveGrantRequested?: boolean;
  reason: string;
  document?: File;
  digitalSignature?: boolean;
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

// Helper type for leave approval payload
export interface LeaveApprovalPayload {
  leaveId: number;
  comment?: string;
  registrarGrantedDays?: number;  // For HR/Registrar
  isDeferred?: boolean;            // For HOD
  postponedDefermentDate?: string; // For HOD
}

// Helper type for leave statistics
export interface LeaveStatistics {
  totalApplications: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  cancelledCount: number;
  activeCount: number;
  completedCount: number;
  totalDaysTaken: number;
  averageDaysPerLeave: number;
}

// Helper type for department leave summary
export interface DepartmentLeaveSummary {
  department: string;
  totalApplications: number;
  approvedCount: number;
  pendingCount: number;
  totalDaysTaken: number;
}

// Helper type for leave calendar event
export interface LeaveCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  status: LeaveStatus;
  userId: number;
  userName: string;
}