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
  department: string;
  position: string;
  role: string;
  password: string;
}

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          staffId: 'MOUAU/SS/4434',
          email: 'uwasomba.abel@mouau.edu.ng',
          firstName: 'Abel',
          lastName: 'CHinedu',
          department: 'D-ICT',
          position: 'Senior Lecturer',
          role: 'hr', // staff | hod | hr | admin
          remainingLeaveDays: 28.5,
        },
        {
          id: 2,
          staffId: 'MOUAU/SS/4002',
          email: 'victor.muna@mouau.edu.ng',
          firstName: 'Victor',
          lastName: 'Muna',
          department: 'DICT',
          position: 'HOD',
          role: 'hod',
          remainingLeaveDays: 20,
        },
      ];
    }
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Update user role
  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // Update leave balance
  updateLeaveBalance: async (id: number, days: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/leave-balance`, { days });
    return response.data;
  },
};