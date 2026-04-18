export interface LeaveApplication {
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

// export const leaveService = {
//   applyForLeave: async (formData: FormData) => {
//     const response = await api.post('/leave', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   },

//   getUserLeaves: async (userId: number) => {
//     const response = await api.get(`/leave/user/${userId}`);
//     return response.data;
//   },

//   getLeaveBalance: async (userId: number) => {
//     const response = await api.get(`/leave/balance/${userId}`);
//     return response.data;
//   },

//   getPendingApprovals: async () => {
//     const response = await api.get('/leave/pending');
//     return response.data;
//   },

//   approveLeave: async (leaveId: number, comment?: string) => {
//     const response = await api.put(`/leave/approve/${leaveId}`, { comment });
//     return response.data;
//   },

//   rejectLeave: async (leaveId: number, comment?: string) => {
//     const response = await api.put(`/leave/reject/${leaveId}`, { comment });
//     return response.data;
//   },
// };

// /////////   |||||||||||  Add mock data  ||||||||||||
export const leaveService = {
  applyForLeave: async (formData: FormData) => {
    // Mock successful submission
    await new Promise(resolve => setTimeout(resolve, 1000));
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
        leaveTypeName: "Sick Leave",
        startDate: "2024-02-10",
        endDate: "2024-02-11",
        totalDays: 2,
        reason: "Flu",
        status: "pending",
        appliedAt: "2024-02-09T08:30:00Z"
      }
    ];
  },

  getLeaveBalance: async (userId: number) => {
    return {
      totalDays: 24,
      usedDays: 10,
      remainingDays: 14
    };
  },

  getPendingApprovals: async () => {
    return [
      {
        id: 3,
        user: {
          firstName: "Chidinma",
          lastName: "Jane",
          department: "Mathematics",
          position: "Senior Lecturer"
        },
        leaveTypeName: "Sick Leave",
        startDate: "2024-03-25",
        endDate: "2024-03-26",
        totalDays: 2,
        reason: "Medical appointment",
        status: "pending",
        appliedAt: "2024-03-20T09:00:00Z"
      }
    ];
  },

  approveLeave: async (leaveId: number, comment?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: "Leave approved" };
  },

  rejectLeave: async (leaveId: number, comment?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: "Leave rejected" };
  },
};