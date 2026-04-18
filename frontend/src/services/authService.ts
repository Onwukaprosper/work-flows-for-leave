// import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: string;
  remainingLeaveDays: number;
}

// export const authService = {
//   login: async (credentials: LoginCredentials) => {
//     const response = await api.post('/auth/login', credentials);
//     if (response.data.token) {
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   },

//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   },

//   getCurrentUser: (): User | null => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       return JSON.parse(userStr);
//     }
//     return null;
//   },
// };

// ///////////////    Add mock mode |||||||||||||| ////////
export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Mock login - accept any credentials
    const mockUser = {
      id: 1,
      staffId: "MOUAU001",
      email: credentials.email,
      firstName: "Abel",
      lastName: "Chinedu",
      department: "Computer Science",
      position: "Lecturer",
      role: "admin", // staff | hod | hr | admin
      remainingLeaveDays: 30
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { token: 'mock-token', user: mockUser };
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};