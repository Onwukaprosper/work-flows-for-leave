export interface LeaveApplication {
  hodComment: any;
  hrComment: any;
  id: number;
  userId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedAt: string;
  documentPath?: string;
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export const leaveService = {
  applyForLeave: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock balance deduction for Annual Leave (leaveTypeId = 1)
    const leaveTypeId = formData.get('leaveTypeId');
    const totalDays = Number(formData.get('totalDays')) || 0;
    
    if (leaveTypeId === '1') {
      const existingBalance = localStorage.getItem('mockBalance');
      if (existingBalance) {
        const balance = JSON.parse(existingBalance);
        if (totalDays > balance.remainingDays) {
          throw { response: { data: { message: "Insufficient leave balance." } } };
        }
        balance.usedDays += totalDays;
        balance.remainingDays -= totalDays;
        localStorage.setItem('mockBalance', JSON.stringify(balance));
      }
    }

    return { message: "Leave application submitted successfully" };
  },

  getUserLeaves: async (userId: number) => {
    // Return mock leave data
    return [
      {
        id: 1,
        userId: userId,
        leaveTypeId: 1,
        leaveTypeName: "Annual Leave",
        startDate: "2024-03-15",
        endDate: "2024-03-20",
        totalDays: 5,
        reason: "Family vacation",
        status: "approved",
        appliedAt: "2024-03-01T10:00:00Z"
      },
      {
        id: 2,
        userId: userId,
        leaveTypeId: 2,
        leaveTypeName: "Paternity Leave",
        startDate: "2024-02-10",
        endDate: "2024-02-11",
        totalDays: 2,
        reason: "Son's birthday",
        status: "pending",
        appliedAt: "2024-02-09T08:30:00Z"
      }
    ];
  },

  getLeaveBalance: async (userId: number) => {
    const existing = localStorage.getItem('mockBalance');
    if (existing) {
      return JSON.parse(existing);
    }
    
    const initialBalance = {
      totalDays: 30,
      usedDays: 0,
      remainingDays: 30
    };
    localStorage.setItem('mockBalance', JSON.stringify(initialBalance));
    return initialBalance;
  },

  getPendingApprovals: async () => {
    const existing = localStorage.getItem('mockApprovals');
    if (existing) {
      return JSON.parse(existing);
    }
    
    const initialApprovals = [
      {
        id: 3,
        user: {
          firstName: "Chidinma",
          lastName: "Jane",
          department: "Mathematics",
          position: "Senior Lecturer",
          dateOfAppointment: "2015-08-01",
          role: "staff"
        },
        leaveTypeName: "Sick Leave",
        startDate: "2024-03-25",
        endDate: "2024-03-26",
        totalDays: 2,
        reason: "Medical appointment",
        status: "pending", // HOD needs to see this
        leaveGrantRequested: false,
        appliedAt: "2024-03-20T09:00:00Z"
      },
      {
        id: 4,
        user: {
          firstName: "Emeka",
          lastName: "Okafor",
          department: "Computer Science",
          position: "Professor (HOD)",
          dateOfAppointment: "2010-01-15",
          role: "hod"
        },
        leaveTypeName: "Annual Leave",
        startDate: "2024-05-01",
        endDate: "2024-05-30",
        totalDays: 30,
        reason: "Annual vacation",
        status: "pending", // VC needs to see this directly
        leaveGrantRequested: true,
        appliedAt: "2024-04-10T11:00:00Z"
      },
      {
        id: 5,
        user: {
          firstName: "Amina",
          lastName: "Bello",
          department: "Physics",
          position: "Lecturer I",
          dateOfAppointment: "2018-09-01",
          role: "staff"
        },
        leaveTypeName: "Maternity Leave",
        startDate: "2024-06-01",
        endDate: "2024-08-30",
        totalDays: 90,
        reason: "Maternity",
        status: "vc_approved", // HR needs to see this
        leaveGrantRequested: false,
        appliedAt: "2024-04-15T14:00:00Z"
      }
    ];
    localStorage.setItem('mockApprovals', JSON.stringify(initialApprovals));
    return initialApprovals;
  },

  approveLeave: async (leaveId: number, payload?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userStr = localStorage.getItem('user');
    const userRole = userStr ? JSON.parse(userStr).role : 'admin';
    
    const existing = localStorage.getItem('mockApprovals');
    if (existing) {
      let approvals = JSON.parse(existing);
      approvals = approvals.map((app: any) => {
        if (app.id === leaveId) {
          const wantsGrant = app.leaveGrantRequested === true;
          
          if (userRole === 'hod') {
            app.status = 'hod_approved';
          } 
          else if (userRole === 'vc') {
            app.status = 'vc_approved';
          }
          else if (userRole === 'hr') {
            if (wantsGrant) app.status = 'pending_bursary';
            else app.status = 'completed';
          }
          else if (userRole === 'bursar') {
            app.status = 'completed';
          }
        }
        return app;
      });
      localStorage.setItem('mockApprovals', JSON.stringify(approvals));
    }
    return { message: "Leave approved" };
  },

  rejectLeave: async (leaveId: number, comment?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = localStorage.getItem('mockApprovals');
    if (existing) {
      let approvals = JSON.parse(existing);
      approvals = approvals.map((app: any) => {
        if (app.id === leaveId) app.status = 'rejected';
        return app;
      });
      localStorage.setItem('mockApprovals', JSON.stringify(approvals));
    }
    return { message: "Leave rejected" };
  },
};