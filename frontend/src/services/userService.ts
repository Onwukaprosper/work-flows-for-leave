// import api from './api';

// export interface User {
//   id: number;
//   staffId: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   department: string;
//   position: string;
//   role: 'staff' | 'hod' | 'hr' | 'admin';
//   remainingLeaveDays: number;
//   createdAt?: string;
// }

// // Mock data for when backend is not available
// const mockUsers: User[] = [
//   {
//     id: 1,
//     staffId: 'MOUAU/SS/4434',
//     email: 'uwasomba.abel@mouau.edu.ng',
//     firstName: 'Abel',
//     lastName: 'Chinedu',
//     department: 'Computer Engineering',
//     position: 'Senior Lecturer',
//     role: 'admin',
//     remainingLeaveDays: 30,
//   },
//   {
//     id: 2,
//     staffId: 'MOUAU002',
//     email: 'prosper.smith@mouau.edu.ng',
//     firstName: 'Prosper',
//     lastName: 'Smith',
//     department: 'Computer Science',
//     position: 'Head of Department',
//     role: 'hod',
//     remainingLeaveDays: 20,
//   },
//   {
//     id: 3,
//     staffId: 'MOUAU003',
//     email: 'victor.muna@mouau.edu.ng',
//     firstName: 'Victor',
//     lastName: 'Muna',
//     department: 'Human Resources',
//     position: 'HR Manager',
//     role: 'hr',
//     remainingLeaveDays: 22,
//   },
//   {
//     id: 4,
//     staffId: 'MOUAU004',
//     email: 'admin@mouau.edu.ng',
//     firstName: 'Admin',
//     lastName: 'VC',
//     department: 'Administration',
//     position: 'System Administrator',
//     role: 'admin',
//     remainingLeaveDays: 24,
//   },
// ];

// export const userService = {
//   getAllUsers: async (): Promise<User[]> => {
//     try {
//       const response = await api.get('/users');
//       console.log('API Response:', response.data);
      
//       // Handle different response formats
//       if (response.data && Array.isArray(response.data)) {
//         return response.data;
//       }
//       if (response.data?.data && Array.isArray(response.data.data)) {
//         return response.data.data;
//       }
//       if (response.data?.users && Array.isArray(response.data.users)) {
//         return response.data.users;
//       }
      
//       console.warn('API did not return an array, using mock data');
//       return mockUsers;
//     } catch (error) {
//       console.error('Failed to fetch users:', error);
//       // Return mock data instead of throwing
//       return mockUsers;
//     }
//   },

//   getUserById: async (id: number): Promise<User> => {
//     try {
//       const response = await api.get(`/users/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       const user = mockUsers.find(u => u.id === id);
//       if (user) return user;
//       throw new Error('User not found');
//     }
//   },

//   createUser: async (userData: Partial<User> & { password?: string }): Promise<User> => {
//     try {
//       const response = await api.post('/users', userData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create user:', error);
//       // Mock creation
//       const newUser: User = {
//         id: Date.now(),
//         staffId: userData.staffId || `MOUAU${String(mockUsers.length + 1).padStart(3, '0')}`,
//         email: userData.email || '',
//         firstName: userData.firstName || '',
//         lastName: userData.lastName || '',
//         department: userData.department || '',
//         position: userData.position || '',
//         role: (userData.role as any) || 'staff',
//         remainingLeaveDays: 24,
//       };
//       return newUser;
//     }
//   },

//   updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
//     try {
//       const response = await api.put(`/users/${id}`, userData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update user:', error);
//       // Mock update
//       const user = mockUsers.find(u => u.id === id);
//       if (user) {
//         return { ...user, ...userData };
//       }
//       throw new Error('User not found');
//     }
//   },

//   deleteUser: async (id: number): Promise<void> => {
//     try {
//       await api.delete(`/users/${id}`);
//     } catch (error) {
//       console.error('Failed to delete user:', error);
//       // Mock success - don't throw
//       return;
//     }
//   },

//   updateUserRole: async (id: number, role: string): Promise<User> => {
//     try {
//       const response = await api.patch(`/users/${id}/role`, { role });
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update user role:', error);
//       const user = mockUsers.find(u => u.id === id);
//       if (user) {
//         return { ...user, role: role as any };
//       }
//       throw new Error('User not found');
//     }
//   },

//   updateLeaveBalance: async (id: number, days: number): Promise<User> => {
//     try {
//       const response = await api.patch(`/users/${id}/leave-balance`, { days });
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update leave balance:', error);
//       const user = mockUsers.find(u => u.id === id);
//       if (user) {
//         return { ...user, remainingLeaveDays: days };
//       }
//       throw new Error('User not found');
//     }
//   },
// };


import api from './api';

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
  createdAt?: string;
}

export interface CreateUserData {
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  role: string;
  password: string;
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    staffId: 'MOUAU/SS/4434',
    email: 'uwasomba.abel@mouau.edu.ng',
    firstName: 'Abel',
    lastName: 'Chinedu',
    department: 'Computer Engineering',
    position: 'Senior Lecturer',
    role: 'admin',
    remainingLeaveDays: 30,
  },
  {
    id: 2,
    staffId: 'MOUAU002',
    email: 'prosper.smith@mouau.edu.ng',
    firstName: 'Prosper',
    lastName: 'Smith',
    department: 'Computer Science',
    position: 'Head of Department',
    role: 'hod',
    remainingLeaveDays: 20,
  },
  {
    id: 3,
    staffId: 'MOUAU003',
    email: 'victor.muna@mouau.edu.ng',
    firstName: 'Victor',
    lastName: 'Muna',
    department: 'Human Resources',
    position: 'HR Manager',
    role: 'hr',
    remainingLeaveDays: 22,
  },
  {
    id: 4,
    staffId: 'MOUAU004',
    email: 'admin@mouau.edu.ng',
    firstName: 'Admin',
    lastName: 'VC',
    department: 'Administration',
    position: 'System Administrator',
    role: 'admin',
    remainingLeaveDays: 24,
  },
];

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return mockUsers;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return mockUsers;
    }
  },

  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const user = mockUsers.find(u => u.id === id);
      if (user) return user;
      throw new Error('User not found');
    }
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      // Mock creation
      const newUser: User = {
        id: Math.max(...mockUsers.map(u => u.id)) + 1,
        staffId: userData.staffId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        department: userData.department || '',
        position: userData.position || '',
        role: userData.role as any,
        remainingLeaveDays: 24,
      };
      mockUsers.push(newUser);
      return newUser;
    }
  },

  updateUser: async (id: number, userData: Partial<User> & { password?: string }): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      // Mock update
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...userData };
        return mockUsers[index];
      }
      throw new Error('User not found');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      // Mock delete
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
      }
    }
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index].role = role as any;
        return mockUsers[index];
      }
      throw new Error('User not found');
    }
  },

  updateLeaveBalance: async (id: number, days: number): Promise<User> => {
    try {
      const response = await api.patch(`/users/${id}/leave-balance`, { days });
      return response.data;
    } catch (error) {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index].remainingLeaveDays = days;
        return mockUsers[index];
      }
      throw new Error('User not found');
    }
  },
};